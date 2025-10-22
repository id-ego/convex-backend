use std::{
    collections::BTreeSet,
    sync::LazyLock,
};

use common::{
    runtime::Runtime,
    types::IndexDescriptor,
};
use database::{
    IndexModel,
    Transaction,
};
use value::TableName;

pub static AIRBYTE_PRIMARY_KEY_INDEX_DESCRIPTOR: LazyLock<IndexDescriptor> =
    LazyLock::new(|| IndexDescriptor::new("_by_airbyte_primary_key").unwrap());

pub struct AirbyteImportModel<'a, RT: Runtime> {
    tx: &'a mut Transaction<RT>,
}

impl<'a, RT: Runtime> AirbyteImportModel<'a, RT> {
    pub fn new(tx: &'a mut Transaction<RT>) -> Self {
        Self { tx }
    }

    pub async fn primary_key_indexes_ready(
        &mut self,
        indexes: &BTreeSet<TableName>,
    ) -> anyhow::Result<bool> {
        IndexModel::new(self.tx)
            .indexes_ready(&AIRBYTE_PRIMARY_KEY_INDEX_DESCRIPTOR, indexes)
            .await
    }
}
