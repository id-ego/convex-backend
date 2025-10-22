use std::{
    collections::HashMap,
    sync::Arc,
};

use anyhow::Context as _;
use clusters::{
    persistence_args_from_cluster_url,
    DbDriverTag,
    PersistenceArgs,
};
use common::{
    knobs::DATABASE_USE_PREPARED_STATEMENTS,
    persistence::{
        Persistence,
        PersistenceReader,
    },
    runtime::Runtime,
    shutdown::ShutdownSignal,
};
use mysql::{
    ConvexMySqlPool,
    MySqlOptions,
    MySqlPersistence,
    MySqlReaderOptions,
};
use postgres::{
    PostgresOptions,
    PostgresPersistence,
    PostgresReaderOptions,
};
use sqlite::SqlitePersistence;
use tokio_postgres::config::TargetSessionAttrs;

#[derive(Copy, Clone, Debug)]
pub struct ConnectPersistenceFlags {
    pub require_ssl: bool,
    pub allow_read_only: bool,
    pub skip_index_creation: bool,
}

pub enum PersistenceSeed<RT: Runtime> {
    Sqlite {
        db_spec: String,
    },
    Postgres {
        config: tokio_postgres::Config,
        options: PostgresOptions,
    },
    MySql {
        pool: Arc<ConvexMySqlPool<RT>>,
        db_name: String,
        options: MySqlOptions,
    },
    #[cfg(any(test, feature = "testing"))]
    Test,
}

pub fn persistence_seed<RT: Runtime>(
    db: DbDriverTag,
    db_spec: &str,
    flags: ConnectPersistenceFlags,
    instance_name: &str,
    runtime: RT,
) -> anyhow::Result<PersistenceSeed<RT>> {
    match db {
        DbDriverTag::Sqlite => Ok(PersistenceSeed::Sqlite {
            db_spec: db_spec.to_owned(),
        }),
        DbDriverTag::Postgres(version)
        | DbDriverTag::PostgresMultiSchema(version)
        | DbDriverTag::PostgresMultitenant(version)
        | DbDriverTag::PostgresAwsIam(version)
        | DbDriverTag::MySql(version)
        | DbDriverTag::MySqlAwsIam(version)
        | DbDriverTag::MySqlMultitenant(version) => {
            let args = persistence_args_from_cluster_url(
                instance_name,
                db_spec.parse()?,
                db,
                flags.require_ssl,
                true, /* require_leader */
            )?;
            match args {
                PersistenceArgs::Postgres {
                    mut url,
                    schema,
                    multitenant,
                } => {
                    let options = PostgresOptions {
                        allow_read_only: flags.allow_read_only,
                        version,
                        schema,
                        instance_name: instance_name.into(),
                        multitenant,
                        skip_index_creation: flags.skip_index_creation,
                    };
                    // tokio-postgres forbids unknown query parameters, so we need to filter out
                    // `search_path` which is our "hack" for propagating the target schema name
                    // to the persistence layer
                    let query = url
                        .query_pairs()
                        .filter(|(k, _)| k != "search_path")
                        .map(|(k, v)| (k.into_owned(), v.into_owned()))
                        .collect::<HashMap<_, _>>();
                    let url = url.query_pairs_mut().clear().extend_pairs(query).finish();
                    Ok(PersistenceSeed::Postgres {
                        config: url
                            .as_str()
                            .parse()
                            .context("invalid postgres connection url")?,
                        options,
                    })
                },
                PersistenceArgs::MySql {
                    url,
                    db_name,
                    multitenant,
                } => {
                    let options = MySqlOptions {
                        allow_read_only: flags.allow_read_only,
                        version,
                        multitenant,
                        instance_name: instance_name.into(),
                    };
                    Ok(PersistenceSeed::MySql {
                        pool: Arc::new(ConvexMySqlPool::new(
                            &url,
                            *DATABASE_USE_PREPARED_STATEMENTS,
                            Some(runtime),
                        )?),
                        db_name,
                        options,
                    })
                },
            }
        },
        #[cfg(any(test, feature = "testing"))]
        DbDriverTag::TestPersistence => Ok(PersistenceSeed::Test),
        #[cfg(not(any(test, feature = "testing")))]
        _ => unreachable!(),
    }
}

pub async fn connect_persistence<RT: Runtime>(
    db: DbDriverTag,
    db_spec: &str,
    flags: ConnectPersistenceFlags,
    instance_name: &str,
    runtime: RT,
    shutdown_signal: ShutdownSignal,
) -> anyhow::Result<Arc<dyn Persistence>> {
    match persistence_seed(db, db_spec, flags, instance_name, runtime)? {
        PersistenceSeed::Sqlite { db_spec } => {
            let persistence = Arc::new(SqlitePersistence::new(&db_spec)?);
            tracing::info!("Connected to SQLite at {db_spec}");
            Ok(persistence as Arc<dyn Persistence>)
        },
        PersistenceSeed::Postgres {
            mut config,
            options,
        } => {
            config.target_session_attrs(TargetSessionAttrs::ReadWrite);
            let pool = PostgresPersistence::create_pool(config)?;
            let persistence =
                Arc::new(PostgresPersistence::with_pool(pool, options, shutdown_signal).await?);
            tracing::info!("Connected to Postgres database: {}", instance_name);
            Ok(persistence)
        },
        PersistenceSeed::MySql {
            pool,
            db_name,
            options,
        } => {
            let persistence = Arc::new(
                MySqlPersistence::new(pool, db_name.clone(), options, shutdown_signal).await?,
            );
            tracing::info!("Connected to MySQL database: {}", db_name);
            Ok(persistence)
        },
        #[cfg(any(test, feature = "testing"))]
        PersistenceSeed::Test => {
            let persistence = Arc::new(common::testing::TestPersistence::new());
            tracing::info!("Connected to TestPersistence");
            Ok(persistence)
        },
    }
}

pub async fn connect_persistence_reader<RT: Runtime>(
    db: DbDriverTag,
    db_spec: &str,
    require_ssl: bool,
    db_should_be_leader: bool,
    instance_name: &str,
    runtime: RT,
) -> anyhow::Result<Arc<dyn PersistenceReader>> {
    match persistence_seed(
        db,
        db_spec,
        ConnectPersistenceFlags {
            require_ssl,
            allow_read_only: true,
            skip_index_creation: false,
        },
        instance_name,
        runtime,
    )? {
        PersistenceSeed::Sqlite { db_spec } => {
            Ok(Arc::new(SqlitePersistence::new(&db_spec)?) as Arc<dyn PersistenceReader>)
        },
        PersistenceSeed::Postgres { config, options } => {
            let options = PostgresReaderOptions {
                version: options.version,
                schema: options.schema,
                instance_name: options.instance_name,
                multitenant: options.multitenant,
            };
            Ok(Arc::new(
                PostgresPersistence::new_reader(
                    PostgresPersistence::create_pool(config)
                        .context("failed to create postgres pool")?,
                    options,
                )
                .await?,
            ))
        },
        PersistenceSeed::MySql {
            pool,
            db_name,
            options,
        } => {
            let options = MySqlReaderOptions {
                db_should_be_leader,
                version: options.version,
                multitenant: options.multitenant,
                instance_name: options.instance_name,
            };
            Ok(Arc::new(MySqlPersistence::new_reader(
                pool, db_name, options,
            )))
        },
        #[cfg(any(test, feature = "testing"))]
        PersistenceSeed::Test => Ok(Arc::new(common::testing::TestPersistence::new())),
    }
}

pub async fn set_read_only<RT: Runtime>(
    db: DbDriverTag,
    db_spec: &str,
    flags: ConnectPersistenceFlags,
    instance_name: &str,
    runtime: RT,
    read_only: bool,
) -> anyhow::Result<()> {
    match persistence_seed(db, db_spec, flags, instance_name, runtime)? {
        PersistenceSeed::Postgres { config, options } => {
            let pool = PostgresPersistence::create_pool(config)?;
            PostgresPersistence::set_read_only(pool, options, read_only).await?;
            Ok(())
        },
        PersistenceSeed::MySql {
            pool,
            db_name,
            options,
        } => {
            MySqlPersistence::set_read_only(pool, db_name, options, read_only).await?;
            Ok(())
        },
        _ => anyhow::bail!("unsupported persistence type: {db:?}"),
    }
}
