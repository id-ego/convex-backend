use std::{
    net::{
        Ipv4Addr,
        SocketAddrV4,
    },
    time::Duration,
};

use axum::{
    body::Body,
    response::Response,
    routing::{
        get,
        post,
    },
    Router,
};
use common::{
    assert_obj,
    http::{
        ConvexHttpService,
        NoopRouteMapper,
    },
    pause::PauseController,
    runtime::Runtime,
    testing::{
        assert_contains,
        TestPersistence,
    },
};
use database::UserFacingModel;
use http::{
    Request,
    StatusCode,
};
use http_body_util::BodyExt;
use itertools::Itertools;
use keybroker::Identity;
use must_let::must_let;
use runtime::{
    prod::ProdRuntime,
    testing::TestRuntime,
};
use semver::Version;
use serde_json::json;
use tokio::select;
use value::{
    val,
    ConvexValue,
    TableNamespace,
};

use crate::{
    test_helpers::{
        UdfTest,
        UdfTestConfig,
    },
    tests::http_action::{
        http_post_request,
        http_request,
    },
    IsolateConfig,
};

#[convex_macro::test_runtime]
async fn test_fetch_not_allowed_in_queries(rt: TestRuntime) -> anyhow::Result<()> {
    let t = UdfTest::default(rt).await?;
    assert_contains(
        &t.query_js_error("fetch:fromQuery", assert_obj!()).await?,
        "Can't use fetch() in queries and mutations. Please consider using an action.",
    );
    Ok(())
}

async fn serve(router: Router, port: u16) {
    let (_shutdown_tx, mut shutdown_rx) = async_broadcast::broadcast::<()>(1);
    _ = ConvexHttpService::new(
        router,
        "http_test",
        "0.0.1".to_owned(),
        1,
        Duration::from_secs(125),
        NoopRouteMapper,
    )
    .serve(
        SocketAddrV4::new(Ipv4Addr::new(127, 0, 0, 1), port).into(),
        async move {
            let _ = shutdown_rx.recv().await;
        },
    )
    .await
}

#[convex_macro::prod_rt_test]
async fn test_fetch_basic(rt: ProdRuntime) -> anyhow::Result<()> {
    let redirect_handler = |req: Request<Body>| async move {
        let target = req
            .headers()
            .get("x-location")
            .cloned()
            .unwrap_or("/assets/fixture.json".parse().unwrap());
        Response::builder()
            .status(StatusCode::MOVED_PERMANENTLY)
            .header(hyper::header::LOCATION, target)
            .body(Body::empty())
            .unwrap()
    };
    // Start http server to serve static routes.
    let router = Router::new()
        .route(
            "/assets/fixture.json",
            get(|| async {
                Response::builder()
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&json!({
                            "name": "convex",
                        }))
                        .expect("invalid json"),
                    ))
                    .expect("invalid response")
            }),
        )
        .route(
            "/echo_server",
            post(|req: Request<Body>| async {
                let (parts, body) = req.into_parts();
                let mut response = Response::new(body);
                response.headers_mut().extend(parts.headers);
                response
            }),
        )
        .route("/assets/hello.txt", get(redirect_handler))
        .route("/post_redirect_to_get", post(redirect_handler))
        .route("/a/b/c", get(redirect_handler))
        .route(
            "/redirect_body",
            post(|| async {
                Response::builder()
                    .status(StatusCode::PERMANENT_REDIRECT)
                    .header(hyper::header::LOCATION, "/echo_server")
                    .body(Body::empty())
                    .unwrap()
            }),
        )
        .route(
            "/proxy_reject",
            get(|| async {
                Response::builder()
                    .status(StatusCode::PROXY_AUTHENTICATION_REQUIRED)
                    .body(Body::from("Sorry can't do that"))
                    .expect("invalid response")
            }),
        )
        .route(
            "/subdir/form_urlencoded.txt",
            get(|| async {
                Response::builder()
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body(Body::from("field_1=Hi&field_2=%3CConvex%3E"))
                    .expect("invalid response")
            }),
        )
        .route(
            "/multipart_form_data.txt",
            get(|| async {
                let b = "Preamble\r\n--boundary\t \r\nContent-Disposition: form-data; \
                         name=\"field_1\"\r\n\r\nvalue_1 \
                         \r\n\r\n--boundary\r\nContent-Disposition: form-data; \
                         name=\"field_2\";filename=\"file.js\"\r\nContent-Type: \
                         text/javascript\r\n\r\nconsole.log(\"Hi\")\r\n--boundary--\r\nEpilogue";
                Response::builder()
                    .header("Content-Type", "multipart/form-data;boundary=boundary")
                    .body(Body::from(b))
                    .expect("invalid response")
            }),
        )
        .route(
            "/multipart_form_bad_content_type",
            get(|| async {
                let b = "Preamble\r\n--boundary\t \r\nContent-Disposition: form-data; \
                         name=\"field_1\"\r\n\r\nvalue_1 \
                         \r\n\r\n--boundary\r\nContent-Disposition: form-data; \
                         name=\"field_2\";filename=\"file.js\"\r\nContent-Type: \
                         text/javascript\r\n\r\nconsole.log(\"Hi\")\r\n--boundary--\r\nEpilogue";
                Response::builder()
                    .header(
                        "Content-Type",
                        "multipart/form-dataststst;boundary=boundary",
                    )
                    .body(Body::from(b))
                    .expect("invalid response")
            }),
        )
        .route(
            "/echo_multipart_file",
            post(|req: Request<Body>| async {
                let body = req.into_body();
                let bytes = body.collect().await.unwrap().to_bytes();
                let start = b"--boundary\t \r\n\
                    Content-Disposition: form-data; name=\"field_1\"\r\n\
                    \r\n\
                    value_1 \r\n\
                    \r\n--boundary\r\n\
                    Content-Disposition: form-data; name=\"file\"; \
                    filename=\"file.bin\"\r\n\
                    Content-Type: application/octet-stream\r\n\
                    \r\n";
                let end = b"\r\n--boundary--\r\n";
                let b = [start as &[u8], &bytes[..], end].concat();

                Response::builder()
                    .header("content-type", "multipart/form-data;boundary=boundary")
                    .body(Body::from(b))
                    .expect("invalid response")
            }),
        );
    let _server = rt.spawn("test_server", serve(router, 4545));
    let redirected_router = Router::new().route(
        "/print_auth",
        get(|req: Request<Body>| async move {
            Response::builder()
                .body(Body::from(
                    serde_json::to_string(&json!({
                        "auth": match req.headers().get("Authorization") {
                            Some(header) => header.to_str().unwrap(),
                            None => "None",
                        },
                    }))
                    .expect("invalid json"),
                ))
                .expect("invalid response")
        }),
    );
    let _router = rt.spawn("test_router", serve(redirected_router, 4547));

    let t = UdfTest::default(rt).await?;
    must_let!(let (ConvexValue::String(r), _outcome, log_lines) = t.action_outcome_and_log_lines(
        "fetch",
        assert_obj!(),
        Identity::system(),
    ).await?);
    assert_eq!(String::from(r), "success".to_string());
    assert!(log_lines.is_empty());

    // Interaction between fetch and Request/Response blobs.
    let response = t
        .http_action(
            "http_action",
            http_request("proxy_response"),
            Identity::system(),
        )
        .await?;
    must_let!(let Some(body) = response.body().clone());
    assert_eq!(std::str::from_utf8(&body)?, "Hello World");
    let round_trip_test = |endpoint: &'static str| async {
        let response = t
            .http_action(
                "http_action",
                http_post_request(endpoint, "[0,\"Hello\"]".as_bytes().to_vec()),
                Identity::system(),
            )
            .await?;
        must_let!(let Some(body) = response.body().clone());
        assert_eq!(std::str::from_utf8(&body)?, "[0,\"Hello\"]");
        anyhow::Ok(())
    };
    round_trip_test("round_trip_fetch_blob").await?;
    round_trip_test("round_trip_fetch_text").await?;
    round_trip_test("round_trip_fetch_array_buffer").await?;
    round_trip_test("round_trip_fetch_json").await?;

    Ok(())
}

// TODO(ENG-7281) fix flakes
#[ignore]
#[convex_macro::prod_rt_test]
async fn test_fetch_timing(rt: ProdRuntime) -> anyhow::Result<()> {
    let rt_ = rt.clone();
    // Start http server to serve static routes.
    let router = Router::new()
        .route(
            "/echo_server",
            post(|req: Request<Body>| async {
                let (parts, body) = req.into_parts();
                let mut response = Response::new(body);
                response.headers_mut().extend(parts.headers);
                response
            }),
        )
        .route(
            "/timeout",
            get(|| async move {
                // To test parallel fetches, we race /timeout against /echo_server.
                // To make sure /echo_server finishes first, /timeout takes a while.
                rt_.wait(Duration::from_secs(3)).await;
                Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::from("timeout"))
                    .expect("invalid response")
            }),
        );
    let _router = rt.spawn("test_router", serve(router, 4546));

    let t = UdfTest::default(rt.clone()).await?;

    t.action("fetch:fetchInParallel", assert_obj!()).await?;

    let log_lines = t
        .action_log_lines("fetch:danglingFetch", assert_obj!())
        .await?;
    assert_eq!(
        log_lines.into_iter().map(|l| l.to_pretty_string_test_only()).collect_vec(),
        vec![
            "[WARN] 1 unawaited operation: [fetch]. Async operations should be awaited or they might not run. See https://docs.convex.dev/functions/actions#dangling-promises for more information."
                .to_string()
        ]
    );

    let t = UdfTest::with_timeout(rt, Some(Duration::from_secs(1))).await?;

    let e = t
        .action_js_error("fetch:fetchTimeout", assert_obj!())
        .await?;
    assert_contains(&e, "Function execution timed out");
    let e = t
        .action_js_error("fetch:fetchUnendingRequest", assert_obj!())
        .await?;
    assert_contains(&e, "Function execution timed out");
    t.action("fetch:fetchBlockedOnTimeouts", assert_obj!())
        .await?;

    Ok(())
}

#[convex_macro::prod_rt_test]
async fn test_fetch_abort(rt: ProdRuntime) -> anyhow::Result<()> {
    let t = UdfTest::default_with_config(
        UdfTestConfig {
            isolate_config: IsolateConfig::default(),
            udf_server_version: Version::parse("1000.0.0").unwrap(),
        },
        3,
        rt.clone(),
    )
    .await?;
    let (pause_controller, pause_client) = PauseController::new();
    let hold = pause_controller.hold("pause_fetch");
    let router = Router::new().route(
        "/pause",
        get(|| async move {
            pause_client.wait("pause_fetch").await;
            Response::builder().body(Body::from("ok")).unwrap()
        }),
    );
    let _router = rt.spawn("test_router", serve(router, 4548));

    // fetchAbort is an action that fetches from /pause, and in parallel it
    // waits for triggerAbort. When triggerAbort is called, it aborts the fetch
    // and waits for the fetch to throw an error, then returns success.

    let mut result_fut = Box::pin(t.action("fetch:fetchAbort", assert_obj!()));
    let paused = select! {
        _ = &mut result_fut => {
            anyhow::bail!("fetchAbort should pause");
        },
        paused = hold.wait_for_blocked() => {
            let paused = paused.unwrap();
            trigger_abort(&t).await?;
            paused
        },
    };

    // The action is able to finish before the fetch returns.
    let result = result_fut.await?;
    assert_eq!(result, val!("success"));
    paused.unpause();

    Ok(())
}

async fn trigger_abort(t: &UdfTest<ProdRuntime, TestPersistence>) -> anyhow::Result<()> {
    let mut tx = t.database.begin(Identity::system()).await?;
    // NOTE: you can't run a mutation in prod_rt_test, because time is paused but
    // raw_mutation advances time.
    UserFacingModel::new(&mut tx, TableNamespace::Global)
        .insert("triggerAbort".parse()?, assert_obj!())
        .await?;
    t.database.commit(tx).await?;
    Ok(())
}
