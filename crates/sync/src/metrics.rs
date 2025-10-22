use std::time::Duration;

use metrics::{
    log_counter_with_labels,
    log_distribution_with_labels,
    register_convex_counter,
    register_convex_histogram,
    StaticMetricLabel,
    StatusTimer,
    STATUS_LABEL,
};
use serde::{
    Deserialize,
    Serialize,
};
use serde_json::Value as JsonValue;
use sync_types::{
    types::ClientEvent,
    ClientMessage,
    Timestamp,
};
register_convex_histogram!(
    SYNC_CONNECT_SECONDS,
    "Time between SyncWorker creation and receiving Connect message",
    &[STATUS_LABEL[0], "partition_id"]
);
/// Measuring time between SyncWorker creation and receiving Connect message.
pub fn connect_timer(partition_id: u64) -> StatusTimer {
    let mut timer = StatusTimer::new(&SYNC_CONNECT_SECONDS);
    timer.add_label(StaticMetricLabel::new(
        "partition_id",
        partition_id.to_string(),
    ));
    timer
}

register_convex_histogram!(
    SYNC_HANDLE_MESSAGE_SECONDS,
    "Time to handle a websocket message",
    &[STATUS_LABEL[0], "partition_id", "endpoint"]
);
pub fn handle_message_timer(partition_id: u64, message: &ClientMessage) -> StatusTimer {
    let mut timer = StatusTimer::new(&SYNC_HANDLE_MESSAGE_SECONDS);
    let request_name = match message {
        ClientMessage::Authenticate { .. } => "Authenticate",
        ClientMessage::Connect { .. } => "Connect",
        ClientMessage::Action { .. } => "Action",
        ClientMessage::ModifyQuerySet { .. } => "ModifyQuerySet",
        ClientMessage::Mutation { .. } => "Mutation",
        ClientMessage::Event { .. } => "Event",
    };
    timer.add_label(StaticMetricLabel::new("endpoint", request_name.to_owned()));
    timer.add_label(StaticMetricLabel::new(
        "partition_id",
        partition_id.to_string(),
    ));
    timer
}

register_convex_histogram!(
    SYNC_UPDATE_QUERIES_SECONDS,
    "Time to update queries",
    &[STATUS_LABEL[0], "partition_id"]
);
pub fn update_queries_timer(partition_id: u64) -> StatusTimer {
    let mut timer = StatusTimer::new(&SYNC_UPDATE_QUERIES_SECONDS);
    timer.add_label(StaticMetricLabel::new(
        "partition_id",
        partition_id.to_string(),
    ));
    timer
}

register_convex_histogram!(
    MODIFY_QUERY_TO_TRANSITION_SECONDS,
    "Time between getting a ModifyQuerySet message and sending the Transition",
    &[STATUS_LABEL[0], "partition_id"]
);
pub fn modify_query_to_transition_timer(partition_id: u64) -> StatusTimer {
    let mut timer = StatusTimer::new(&MODIFY_QUERY_TO_TRANSITION_SECONDS);
    timer.add_label(StaticMetricLabel::new(
        "partition_id",
        partition_id.to_string(),
    ));
    timer
}

register_convex_histogram!(
    SYNC_MUTATION_QUEUE_SECONDS,
    "Time between a mutation entering and exiting the single threaded sync worker queue",
    &[STATUS_LABEL[0], "partition_id"]
);
pub fn mutation_queue_timer(partition_id: u64) -> StatusTimer {
    let mut timer = StatusTimer::new(&SYNC_MUTATION_QUEUE_SECONDS);
    timer.add_label(StaticMetricLabel::new(
        "partition_id",
        partition_id.to_string(),
    ));
    timer
}

register_convex_histogram!(
    SYNC_QUERY_MODIFICATION_ARGS_BYTES,
    "Size of query modification args in ClientMessages",
    &["partition_id"]
);
pub fn log_query_modification_args_size(partition_id: u64, size: usize) {
    log_distribution_with_labels(
        &SYNC_QUERY_MODIFICATION_ARGS_BYTES,
        size as f64,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_MUTATION_ARGS_BYTES,
    "Size of mutation args in ClientMessages",
    &["partition_id"]
);
pub fn log_mutation_args_size(partition_id: u64, size: usize) {
    log_distribution_with_labels(
        &SYNC_MUTATION_ARGS_BYTES,
        size as f64,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_ACTION_ARGS_BYTES,
    "Size of action args in ClientMessages",
    &["partition_id"]
);
pub fn log_action_args_size(partition_id: u64, size: usize) {
    log_distribution_with_labels(
        &SYNC_ACTION_ARGS_BYTES,
        size as f64,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_counter!(
    SYNC_QUERY_FAILED_TOTAL,
    "Number of query failures",
    &["partition_id"]
);
pub fn log_query_failed(partition_id: u64) {
    log_counter_with_labels(
        &SYNC_QUERY_FAILED_TOTAL,
        1,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(SYNC_QUERY_SET_TOTAL, "Size of query set", &["partition_id"]);
pub fn log_query_set_size(partition_id: u64, num_queries: usize) {
    log_distribution_with_labels(
        &SYNC_QUERY_SET_TOTAL,
        num_queries as f64,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_counter!(
    SYNC_QUERY_RESULT_DEDUP_TOTAL,
    "Number of deduplicated query results",
    &["partition_id"]
);
pub fn log_query_result_dedup(partition_id: u64, same_value: bool) {
    let sample = if same_value { 1 } else { 0 };
    log_counter_with_labels(
        &SYNC_QUERY_RESULT_DEDUP_TOTAL,
        sample,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_counter!(
    SYNC_EMPTY_TRANSITION_TOTAL,
    "Number of empty transitions",
    &["partition_id"]
);
pub fn log_empty_transition(partition_id: u64) {
    log_counter_with_labels(
        &SYNC_EMPTY_TRANSITION_TOTAL,
        1,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_counter!(
    SYNC_CONNECT_TOTAL,
    "Number of new WS connections",
    &["partition_id", "reason"]
);
register_convex_histogram!(
    SYNC_RECONNECT_PREV_CONNECTIONS,
    "How many previous connections happened on a given reconnect",
    &["partition_id"]
);
pub fn log_connect(partition_id: u64, last_close_reason: String, connection_count: u32) {
    log_counter_with_labels(
        &SYNC_CONNECT_TOTAL,
        1,
        vec![
            StaticMetricLabel::new("reason", last_close_reason),
            StaticMetricLabel::new("partition_id", partition_id.to_string()),
        ],
    );
    log_distribution_with_labels(
        &SYNC_RECONNECT_PREV_CONNECTIONS,
        connection_count.into(),
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_TRANSITION_MESSAGE_SIZE_BYTES,
    "Heap size of Transition messages sent to clients",
    &["partition_id"]
);
pub fn log_transition_size(partition_id: u64, transition_heap_size: usize) {
    log_distribution_with_labels(
        &SYNC_TRANSITION_MESSAGE_SIZE_BYTES,
        transition_heap_size as f64,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_LINEARIZABILITY_DELAY_SECONDS,
    "How far behind the current backend is behind what the client has observed",
    &["partition_id"]
);
pub fn log_linearizability_violation(partition_id: u64, delay_secs: f64) {
    log_distribution_with_labels(
        &SYNC_LINEARIZABILITY_DELAY_SECONDS,
        delay_secs,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_PROCESS_CLIENT_MESSAGE_SECONDS,
    "Delay between receiving a client message over the web socket and processing it",
    &["partition_id"],
);
pub fn log_process_client_message_delay(partition_id: u64, delay: Duration) {
    log_distribution_with_labels(
        &SYNC_PROCESS_CLIENT_MESSAGE_SECONDS,
        delay.as_secs_f64(),
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_CLIENT_CONSTRUCT_TO_FIRST_MESSAGE_SECONDS,
    "Time from client construction to first message",
    &["partition_id"],
);
pub fn log_client_construct_to_first_message_millis(partition_id: u64, ms: f64) {
    log_distribution_with_labels(
        &SYNC_CLIENT_CONSTRUCT_TO_FIRST_MESSAGE_SECONDS,
        ms / 1000.0,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_histogram!(
    SYNC_CLIENT_CONSTRUCT_TO_WEBSOCKET_OPENED_SECONDS,
    "Time from client construction to websocket open",
    &["partition_id"]
);
pub fn log_client_construct_to_websocket_opened_millis(partition_id: u64, ms: f64) {
    log_distribution_with_labels(
        &SYNC_CLIENT_CONSTRUCT_TO_WEBSOCKET_OPENED_SECONDS,
        ms / 1000.0,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

register_convex_counter!(
    SYNC_CLIENT_METRICS_INCOMPLETE_TOTAL,
    "Number of incomplete metric reports from the client",
    &["partition_id"]
);
pub fn log_client_metrics_incomplete(partition_id: u64) {
    log_counter_with_labels(
        &SYNC_CLIENT_METRICS_INCOMPLETE_TOTAL,
        1,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
}

pub fn log_client_connect_timings(partition_id: u64, marks: Vec<ClientMark>) {
    let mut client_constructed: Option<f64> = None;
    let mut websocket_opened: Option<f64> = None;
    let mut first_message_received: Option<f64> = None;
    for mark in marks {
        match mark.name {
            ClientMarkName::ClientConstructed => client_constructed = Some(mark.start_time),
            ClientMarkName::WebSocketOpen => websocket_opened = Some(mark.start_time),
            ClientMarkName::FirstMessageReceived => first_message_received = Some(mark.start_time),
        }
    }
    match (client_constructed, websocket_opened, first_message_received) {
        (Some(construct), Some(opened), Some(first)) => {
            log_client_construct_to_first_message_millis(partition_id, first - construct);
            log_client_construct_to_websocket_opened_millis(partition_id, opened - construct);
        },
        _ => {
            log_client_metrics_incomplete(partition_id);
        },
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
#[cfg_attr(test, derive(proptest_derive::Arbitrary))]
pub enum ClientMarkName {
    /// When a client is constructed (the browser client, not the React client)
    ClientConstructed,
    /// When the browser/runtime runs `WebSocket.onopen`
    WebSocketOpen,
    /// When the client receives its first WebSocket message from the server
    FirstMessageReceived,
}

#[derive(Clone, Debug, PartialEq)]
#[cfg_attr(test, derive(proptest_derive::Arbitrary))]
pub struct ClientMark {
    pub name: ClientMarkName,
    pub start_time: f64,
}

impl TryFrom<JsonValue> for ClientMark {
    type Error = anyhow::Error;

    fn try_from(value: JsonValue) -> Result<Self, Self::Error> {
        let v: ClientMarkJson = serde_json::from_value(value)?;
        let client_mark = match v.name {
            ClientMarkNameJson::ClientConstructed => ClientMark {
                name: ClientMarkName::ClientConstructed,
                start_time: v.start_time,
            },
            ClientMarkNameJson::WebSocketOpen => ClientMark {
                name: ClientMarkName::WebSocketOpen,
                start_time: v.start_time,
            },
            ClientMarkNameJson::FirstMessageReceived => ClientMark {
                name: ClientMarkName::FirstMessageReceived,
                start_time: v.start_time,
            },
        };
        Ok(client_mark)
    }
}

pub fn log_client_transition(partition_id: u64, transition_transit_time: f64, message_length: f64) {
    log_distribution_with_labels(
        &SYNC_TRANSITION_TRANSIT_TIME_SECONDS,
        transition_transit_time / 1000.0,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
    log_distribution_with_labels(
        &SYNC_TRANSITION_MESSAGE_LENGTH_BYTES,
        message_length,
        vec![StaticMetricLabel::new(
            "partition_id",
            partition_id.to_string(),
        )],
    );
    // Only log this for messages 100KB or larger so the portion due to clock skew
    // is smaller.
    if message_length >= 100_000.0 {
        log_distribution_with_labels(
            &SYNC_TRANSITION_BYTES_PER_SECOND,
            message_length / (transition_transit_time / 1000.0),
            vec![StaticMetricLabel::new(
                "partition_id",
                partition_id.to_string(),
            )],
        );
    }
}

#[derive(Clone, Debug)]
pub enum TypedClientEvent {
    ClientConnect {
        marks: Vec<ClientMark>,
    },
    ClientReceivedTransition {
        /// Time from the server sending the transition to the client fully
        /// receiving it (after finishing downloading it), corrected by
        /// an estimated clock skew observed when the client sends a
        /// smaller message in the other direction.
        transition_transit_time: f64,
        message_length: f64,
    },
}

impl TryFrom<ClientEvent> for TypedClientEvent {
    type Error = anyhow::Error;

    fn try_from(value: ClientEvent) -> Result<Self, Self::Error> {
        match value.event_type.as_str() {
            "ClientConnect" => {
                let parsed_marks = if let JsonValue::Array(marks) = value.event {
                    marks
                        .into_iter()
                        .map(ClientMark::try_from)
                        .collect::<anyhow::Result<Vec<_>>>()
                } else {
                    Err(anyhow::anyhow!("Client marks JSON is not an array"))
                }?;
                Ok(TypedClientEvent::ClientConnect {
                    marks: parsed_marks,
                })
            },
            "ClientReceivedTransition" => {
                let event_data: ClientReceivedTransitionEvent =
                    serde_json::from_value(value.event)?;
                Ok(TypedClientEvent::ClientReceivedTransition {
                    transition_transit_time: event_data.transition_transit_time,
                    message_length: event_data.message_length,
                })
            },
            _ => Err(anyhow::anyhow!("Unknown ClientEvent type")),
        }
    }
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
enum ClientMarkNameJson {
    ClientConstructed,
    WebSocketOpen,
    FirstMessageReceived,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ClientMarkJson {
    name: ClientMarkNameJson,
    start_time: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ClientReceivedTransitionEvent {
    transition_transit_time: f64,
    message_length: f64,
}

register_convex_histogram!(
    SYNC_TRANSITION_TRANSIT_TIME_SECONDS,
    "Time for transition to transit from client (corrected by an estimated clock skew)",
    &["partition_id"]
);
register_convex_histogram!(
    SYNC_TRANSITION_MESSAGE_LENGTH_BYTES,
    "Length of transition message from client",
    &["partition_id"]
);
register_convex_histogram!(
    SYNC_TRANSITION_BYTES_PER_SECOND,
    "Length of transition message over server-to-client transit time, from client",
    &["partition_id"]
);
register_convex_histogram!(
    SYNC_QUERY_INVALIDATION_LAG_SECONDS,
    "Time between an invalidating write and a query being rerun",
    &["partition_id"]
);
register_convex_counter!(
    SYNC_QUERY_INVALIDATION_LAG_UNKNOWN_TOTAL,
    "Count of query subscriptions invalidated where the correspoding invalidating write timestamp \
     was unknown",
    &["partition_id"]
);
pub fn log_query_invalidated(
    partition_id: u64,
    invalid_ts: Option<Timestamp>,
    current_ts: Timestamp,
) {
    if let Some(invalid_ts) = invalid_ts {
        log_distribution_with_labels(
            &SYNC_QUERY_INVALIDATION_LAG_SECONDS,
            current_ts.secs_since_f64(invalid_ts),
            vec![StaticMetricLabel::new(
                "partition_id",
                partition_id.to_string(),
            )],
        );
    } else {
        log_counter_with_labels(
            &SYNC_QUERY_INVALIDATION_LAG_UNKNOWN_TOTAL,
            1,
            vec![StaticMetricLabel::new(
                "partition_id",
                partition_id.to_string(),
            )],
        );
    }
}
