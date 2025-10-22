---
title: "Functions"
slug: "functions"
sidebar_position: 10
description:
  "Run, test, and monitor Convex functions with metrics and performance data"
---

![Functions Dashboard View](/screenshots/functions.png)

[함수 페이지](https://dashboard.convex.dev/deployment/functions)에는 현재 배포된 모든 Convex 함수가 표시됩니다.

개발 배포의 경우 [`npx convex dev`](/cli.md#run-the-convex-dev-server)에 의해 지속적으로 업데이트됩니다. 프로덕션 배포의 함수는 [`npx convex deploy`](/cli.md#deploy-convex-functions-to-production)로 등록됩니다.

## 함수 실행

대시보드에서 Convex 함수를 실행하려면 페이지 왼쪽의 목록에서 함수를 선택하고 함수 이름 옆에 나타나는 "Run Function" 버튼을 클릭하세요.

함수 페이지가 아닌 경우에도 모든 배포 페이지의 오른쪽 하단에 표시되는 지속적인 _fn_ 버튼을 통해 이 UI를 열 수 있습니다. 함수 러너를 여는 키보드 단축키는 Ctrl + ` (백틱)입니다.

이 뷰를 통해 함수의 인수를 입력하고 실행할 수 있습니다.

쿼리 결과는 함수 인수를 수정하고 데이터가 변경되면 자동으로 업데이트됩니다.

뮤테이션 및 액션 결과는 "Run" 버튼을 클릭하면 표시됩니다.

이러한 결과에는 함수의 로그와 반환된 값이 표시됩니다. 함수를 실행할 때 변경된 내용을 보려면 [데이터 페이지](/dashboard/deployments/data.md)를 참조하세요.

![Running a function](/screenshots/run_function.png)

배포된 함수 중 하나 대신 "Custom test query" 옵션을 선택하여 [커스텀 쿼리 함수를 작성](/dashboard/deployments/data.md#writing-custom-queries)할 수도 있습니다.

### 페이지네이션된 함수 쿼리

대시보드에서 페이지네이션된 함수를 쿼리할 때 UI는 인수에 [`PaginationOptions`](/api/interfaces/server.PaginationOptions)가 포함될 것으로 예상합니다. 즉, `numItems` 필드와 선택적으로 `cursor` 필드를 포함하는 객체입니다. 이 인수의 이름은 쿼리 함수에 정의된 이름과 동일해야 합니다.

- `numItems`는 페이지에 포함할 항목 수여야 합니다
- `cursor`는 페이지네이션을 시작하기 위해 비워둘 수 있습니다. 결과를 받은 후 `cursor`를 결과의 `continueCursor` 필드로 설정하여 다음 페이지로 진행할 수 있습니다.

### 사용자 아이덴티티 가정

<Admonition type="tip">

Convex 대시보드에서 사용자 아이덴티티를 가정하는 것은 실제 사용자 아이덴티티에 대한 액세스를 제공하지 않습니다. 대신 이 개념은 함수에 사용자 아이덴티티를 "모킹"하는 것으로 생각할 수 있습니다.

</Admonition>

인증된 애플리케이션을 구축하는 경우 인증된 사용자 아이덴티티로 작동하면서 Convex 함수를 실행하고 싶을 수 있습니다.

그렇게 하려면 "Act as a user" 체크박스를 선택하세요.

거기에서 나타나는 상자에 입력하여 사용자 아이덴티티 객체를 채울 수 있습니다.

![Acting as a user](/screenshots/acting_as_a_user.png)

유효한 사용자 속성은 다음과 같습니다:

| Attribute           | Type                                     |
| ------------------- | ---------------------------------------- |
| subject\*           | string                                   |
| issuer\*            | string                                   |
| name                | string                                   |
| givenName           | string                                   |
| familyName          | string                                   |
| nickname            | string                                   |
| preferredUsername   | string                                   |
| profileUrl          | string                                   |
| email               | string                                   |
| emailVerified       | boolean                                  |
| gender              | string                                   |
| birthday            | string                                   |
| timezone            | string                                   |
| language            | string                                   |
| phoneNumber         | string                                   |
| phoneNumberVerified | boolean                                  |
| address             | string                                   |
| updatedAt           | string (in the form of an RFC 3339 date) |
| customClaims        | object                                   |

\*이 속성들은 필수입니다.

## 메트릭

각 함수에 대한 네 가지 기본 차트가 있습니다. 전체 팀 사용량 메트릭은 [팀 설정](/dashboard/teams.md#usage)을 참조하세요.

### 호출

이 차트는 분당 함수가 호출된 횟수를 표시합니다. 앱의 사용량이 증가하면 이 차트도 상승 추세를 보여야 합니다.

### 오류

함수를 실행하는 동안 발생하는 모든 예외를 표시합니다. 무엇이 잘못되고 있는지 알고 싶으신가요? 아래에 자세히 설명된 로그 페이지를 확인하세요.

### 캐시 적중률

<Admonition type="tip">
캐시 적중률은 쿼리 함수에만 적용됩니다
</Admonition>

이 함수가 단순히 캐시된 값을 재사용하는 빈도 대 재실행되는 빈도의 백분율입니다. 애플리케이션은 높은 캐시 적중률로 가장 잘 실행되며 응답 시간이 가장 빠릅니다.

### 실행 시간

이 함수가 실행되는 데 걸리는 시간(밀리초)입니다.

이 차트에는 p50, p90, p95, p99의 네 가지 개별 선이 표시됩니다. 이러한 각 선은 시간 경과에 따른 적중 분포에서 해당 백분위수의 응답 시간을 나타냅니다. 따라서 p99 선으로 표시된 시간보다 실행하는 데 더 오래 걸린 요청은 1%에 불과합니다. 일반적으로 이러한 _테일 레이턴시_를 주시하는 것이 애플리케이션이 데이터 서비스를 빠르게 받고 있는지 확인하는 좋은 방법입니다.

실행 시간과 캐시 적중률의 관계를 고려하세요. 일반적으로 캐시 적중은 1ms 미만이 소요되므로 캐시 적중률이 높을수록 응답 시간이 더 좋아집니다.

차트를 클릭하면 검사하는 시간 범위를 사용자 정의할 수 있는 더 크고 상세한 뷰가 제공됩니다.
