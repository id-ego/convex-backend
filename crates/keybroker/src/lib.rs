#![feature(try_blocks)]
#![feature(type_alias_impl_trait)]
#![feature(impl_trait_in_assoc_type)]

mod broker;
mod encryptor;
mod legacy_encryptor;
mod metrics;
mod secret;
#[cfg(any(test, feature = "testing"))]
pub mod testing;

#[cfg(test)]
mod tests;

pub use sync_types::UserIdentityAttributes;

pub use self::{
    broker::{
        AdminIdentity,
        AdminIdentityPrincipal,
        CoreIdTokenWithCustomClaims,
        CustomClaims,
        GetFileAuthorization,
        Identity,
        KeyBroker,
        StoreFileAuthorization,
        SystemKey,
        UserIdentity,
    },
    legacy_encryptor::LegacyEncryptor,
    secret::{
        InstanceSecret,
        Secret,
    },
};

pub const DEV_INSTANCE_NAME: &str = include_str!("../dev/instance_name.txt");
pub const DEV_SECRET: &str = include_str!("../dev/secret.txt");
