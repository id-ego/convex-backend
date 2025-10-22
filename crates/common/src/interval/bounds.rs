//! Subset of `std::ops::Bound` specialized for our restricted forms of
//! intervals.
use std::borrow::Borrow;

use value::heap_size::HeapSize;

use super::key::BinaryKey;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd)]
#[cfg_attr(any(test, feature = "testing"), derive(proptest_derive::Arbitrary))]
pub struct StartIncluded(pub BinaryKey);

impl Borrow<[u8]> for StartIncluded {
    fn borrow(&self) -> &[u8] {
        &self.0
    }
}

impl AsRef<[u8]> for StartIncluded {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl HeapSize for StartIncluded {
    fn heap_size(&self) -> usize {
        match self {
            StartIncluded(k) => k.heap_size(),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd)]
#[cfg_attr(any(test, feature = "testing"), derive(proptest_derive::Arbitrary))]
pub enum End {
    Excluded(BinaryKey),
    Unbounded,
}

impl End {
    pub fn after_prefix(key: &BinaryKey) -> Self {
        match key.increment() {
            None => Self::Unbounded,
            Some(key) => Self::Excluded(key),
        }
    }

    /// Is the interval `(-inf, end)` disjoint with `[start, +inf)`?
    pub fn is_disjoint(&self, start: &StartIncluded) -> bool {
        match (self, start) {
            (End::Unbounded, _) => false,
            (End::Excluded(ref s), StartIncluded(ref t)) => s <= t,
        }
    }

    pub fn is_adjacent(&self, start: &StartIncluded) -> bool {
        match (self, start) {
            (End::Unbounded, _) => false,
            (End::Excluded(ref s), StartIncluded(ref t)) => s[..].eq(&t[..]),
        }
    }

    #[inline]
    pub const fn as_ref(&self) -> EndRef<'_> {
        match self {
            End::Excluded(binary_key) => EndRef::Excluded(binary_key.as_slice()),
            End::Unbounded => EndRef::Unbounded,
        }
    }

    #[inline]
    pub fn greater_than(&self, key: &[u8]) -> bool {
        self.as_ref().greater_than(key)
    }
}

impl HeapSize for End {
    fn heap_size(&self) -> usize {
        match self {
            End::Excluded(k) => k.heap_size(),
            End::Unbounded => 0,
        }
    }
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum EndRef<'a> {
    Excluded(&'a [u8]),
    Unbounded,
}

impl EndRef<'_> {
    pub fn to_owned(&self) -> End {
        match *self {
            EndRef::Excluded(bytes) => End::Excluded(BinaryKey::from(bytes.to_owned())),
            EndRef::Unbounded => End::Unbounded,
        }
    }

    #[inline]
    pub fn greater_than(&self, key: &[u8]) -> bool {
        match *self {
            EndRef::Excluded(end) => key < end,
            EndRef::Unbounded => true,
        }
    }
}

#[cfg(test)]
mod tests {
    use cmd_util::env::env_config;
    use proptest::prelude::*;

    use super::{
        super::key::BinaryKey,
        End,
    };

    proptest! {
        #![proptest_config(
            ProptestConfig { cases: 256 * env_config("CONVEX_PROPTEST_MULTIPLIER", 1), failure_persistence: None, ..ProptestConfig::default() }
        )]

        #[test]
        fn test_end_ordering(key in any::<BinaryKey>()) {
            assert!(End::Excluded(key) < End::Unbounded);
        }
    }
}
