---
title: "Health"
slug: "health"
sidebar_position: 0
description:
  "Monitor your Convex deployment health including failure rates, cache
  performance, scheduler status, and deployment insights for optimization."
---

[헬스 페이지](https://dashboard.convex.dev/deployment/)는 배포의 랜딩 페이지입니다. 이 페이지에서 배포의 상태에 대한 몇 가지 중요한 정보를 볼 수 있습니다.

## 실패율

![Failure Rate Card](/screenshots/health_failure_rate.png)

실패율 카드는 지난 1시간 동안 분당 실패한 요청의 백분율을 보여줍니다. 실패율은 실패한 요청 수를 전체 요청 수로 나눈 값으로 계산됩니다.

## 캐시 적중률

![Cache Hit Rate Card](/screenshots/health_cache_hit_rate.png)

캐시 적중률 카드는 지난 1시간 동안 분당 캐시 적중의 백분율을 보여줍니다. 캐시 적중률은 캐시 적중 수를 전체 요청 수로 나눈 값으로 계산됩니다.

캐시 적중률은 쿼리 함수에만 적용됩니다.

## 스케줄러 상태

![Scheduler Status Card](/screenshots/scheduler_overdue.png)

스케줄러 상태 카드는 [스케줄러](/scheduling/scheduled-functions)의 상태를 보여줍니다. 예약된 작업이 너무 많아 스케줄러가 지연되면 상태가 "Overdue"로 표시되며 지연 시간이 분 단위로 표시됩니다.

카드의 오른쪽 상단 모서리에 있는 버튼을 클릭하여 지난 1시간 동안의 스케줄러 상태를 보여주는 차트를 볼 수 있습니다.

![Scheduler Status Chart](/screenshots/scheduler_status.png)

## 마지막 배포

![Last Deployed Card](/screenshots/health_last_deployed.png)

마지막 배포 카드는 함수가 마지막으로 배포된 시간을 보여줍니다.

## 통합

<Admonition type="info">

통합은 Convex Professional에서만 사용할 수 있습니다.

</Admonition>

![Last Deployed Card](/screenshots/health_integrations.png)

통합 카드는 [예외 보고](/production/integrations/exception-reporting) 및 [로그 스트림](/production/integrations/log-streams) 통합의 상태를 보여주며, 통합을 보고 구성할 수 있는 빠른 링크를 제공합니다.

## 인사이트

![Insights Card](/screenshots/insights.png)

헬스 페이지는 또한 배포에 대한 인사이트를 제공하며 성능 및 안정성을 개선하는 방법에 대한 제안을 제공합니다.

각 인사이트에는 문제에 대한 설명, 배포에 미치는 영향(차트 및 이벤트 로그 포함), 문제에 대해 자세히 알아보고 해결하는 방법에 대한 링크가 포함되어 있습니다.

인사이트를 클릭하면 더 큰 차트와 인사이트를 트리거한 이벤트 목록을 포함한 문제의 분석이 열립니다.

![Insight Breakdown](/screenshots/insights_breakdown.png)

사용 가능한 인사이트는 다음과 같습니다:

- 단일 트랜잭션에서 [너무 많은 바이트를 읽는](/production/state/limits#transactions) 함수.
- 단일 트랜잭션에서 [너무 많은 문서를 읽는](/production/state/limits#transactions) 함수.
- [쓰기 충돌](/error#1)이 발생하는 함수.
