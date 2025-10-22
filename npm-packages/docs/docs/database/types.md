---
title: "데이터 타입"
sidebar_position: 40
description: "Convex 문서에서 지원되는 데이터 타입"
---

import ConvexValues from "@site/docs/\_convexValues.mdx";

모든 Convex 문서는 JavaScript 객체로 정의됩니다. 이러한 객체는 아래 타입 중 하나의 필드 값을 가질 수 있습니다.

[스키마를 정의](/database/schemas.mdx)하여 테이블 내 문서의 형태를 명시할 수 있습니다.

## Convex 값

<ConvexValues />

## 시스템 필드

Convex의 모든 문서에는 자동으로 생성되는 두 가지 시스템 필드가 있습니다:

- `_id`: 문서의 [문서 ID](/database/document-ids.mdx).
- `_creationTime`: 이 문서가 생성된 시간(유닉스 에포크 이후 밀리초).

## 제한

Convex 값은 전체 크기가 1MB 미만이어야 합니다. 이것은 현재로서는 대략적인 제한이지만, 이러한 제한에 도달하고 문서 크기를 계산하는 더 정확한 방법을 원하신다면 [문의해 주세요](https://convex.dev/community). 문서는 다른 Convex 타입을 포함하는 객체나 배열과 같은 중첩된 값을 가질 수 있습니다. Convex 타입은 최대 16단계의 중첩을 가질 수 있으며, 중첩된 값 트리의 누적 크기는 1MB 제한 미만이어야 합니다.

테이블 이름은 영숫자 문자("a"부터 "z", "A"부터 "Z", "0"부터 "9")와 밑줄("\_")을 포함할 수 있으며, 밑줄로 시작할 수 없습니다.

다른 제한에 대한 정보는 [여기](/production/state/limits.mdx)를 참조하세요.

이러한 제한 중 하나라도 맞지 않으면 [알려주세요](https://convex.dev/community)!

## `undefined` 사용하기

TypeScript 값 `undefined`는 유효한 Convex 값이 아니므로 Convex 함수 인수나 반환 값, 또는 저장된 문서에 사용할 수 없습니다.

1. `undefined` 값을 가진 객체/레코드는 필드가 누락된 것과 동일합니다: `{a: undefined}`는 함수에 전달되거나 데이터베이스에 저장될 때 `{}`로 변환됩니다. Convex 함수 호출과 Convex 데이터베이스가 `JSON.stringify`로 데이터를 직렬화하는 것으로 생각할 수 있으며, 이는 유사하게 `undefined` 값을 제거합니다.
2. 객체 필드에 대한 유효성 검사기는 `v.optional(...)`을 사용하여 필드가 없을 수 있음을 나타낼 수 있습니다.
   - 객체의 필드 "a"가 누락된 경우, 즉 `const obj = {};`이면 `obj.a === undefined`입니다. 이것은 Convex에 특정한 것이 아니라 TypeScript/JavaScript의 속성입니다.
3. 필터와 인덱스 쿼리에서 `undefined`를 사용할 수 있으며, 필드가 없는 문서와 일치합니다. 즉, `.withIndex("by_a", q=>q.eq("a", undefined))`는 문서 `{}`와 `{b: 1}`는 일치하지만 `{a: 1}`이나 `{a: null, b: 1}`은 일치하지 않습니다.
   - Convex의 순서 체계에서 `undefined < null < 다른 모든 값`이므로 `q.gte("a", null as any)` 또는 `q.gt("a", undefined)`를 통해 필드가 _있는_ 문서를 일치시킬 수 있습니다.
4. `{a: undefined}`가 `{}`와 다른 경우가 정확히 한 가지 있습니다: `ctx.db.patch`에 전달될 때입니다. `{a: undefined}`를 전달하면 문서에서 필드 "a"를 제거하지만, `{}`를 전달하면 필드 "a"를 변경하지 않습니다. [기존 문서 업데이트](/database/writing-data.mdx#updating-existing-documents)를 참조하세요.
5. `undefined`는 함수 인수에서 제거되지만 `ctx.db.patch`에서는 의미가 있으므로 클라이언트에서 patch의 인수를 전달하는 몇 가지 트릭이 있습니다.
   - 클라이언트가 `args={}`(또는 동등한 `args={a: undefined}`)를 전달하면 필드 "a"를 변경하지 않아야 하는 경우 `ctx.db.patch(id, args)`를 사용하세요.
   - 클라이언트가 `args={}`를 전달하면 필드 "a"를 제거해야 하는 경우 `ctx.db.patch(id, {a: undefined, ...args})`를 사용하세요.
   - 클라이언트가 `args={}`를 전달하면 필드 "a"를 변경하지 않고 `args={a: null}`이면 제거해야 하는 경우 다음과 같이 할 수 있습니다:
     ```ts
     if (args.a === null) {
       args.a = undefined;
     }
     await ctx.db.patch(id, args);
     ```
6. 일반 `undefined`/`void`를 반환하는 함수는 `null`을 반환한 것처럼 처리됩니다.
7. `[undefined]`와 같이 `undefined` 값을 포함하는 배열은 Convex 값으로 사용될 때 오류를 발생시킵니다.

`undefined`의 특수한 동작을 피하고 싶다면 유효한 Convex 값인 `null`을 대신 사용할 수 있습니다.

## 날짜 및 시간 사용하기

Convex에는 날짜와 시간을 다루기 위한 특별한 데이터 타입이 없습니다. 날짜를 저장하는 방법은 애플리케이션의 필요에 따라 달라집니다:

1. 특정 시점만 중요한 경우 [UTC 타임스탬프](https://en.wikipedia.org/wiki/Unix_time)를 저장할 수 있습니다. 밀리초 단위로 타임스탬프를 `number`로 저장하는 `_creationTime` 필드 예제를 따르는 것을 권장합니다. 함수와 클라이언트에서 생성자에 타임스탬프를 전달하여 JavaScript `Date`를 생성할 수 있습니다: `new Date(timeInMsSinceEpoch)`. 그런 다음 원하는 시간대(예: 사용자 컴퓨터의 구성된 시간대)로 날짜와 시간을 출력할 수 있습니다.
   - 현재 UTC 타임스탬프를 함수에서 가져와 데이터베이스에 저장하려면 `Date.now()`를 사용하세요
2. 예약 앱을 구현할 때처럼 달력 날짜나 특정 시계 시간이 중요한 경우 실제 날짜 및/또는 시간을 문자열로 저장해야 합니다. 앱이 여러 시간대를 지원하는 경우 시간대도 저장해야 합니다. [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)은 `"2024-03-21T14:37:15Z"`와 같이 날짜와 시간을 단일 문자열로 함께 저장하는 일반적인 형식입니다. 사용자가 특정 시간대를 선택할 수 있는 경우 일반적으로 [IANA 시간대 이름](https://en.wikipedia.org/wiki/Tz_database#Names_of_time_zones)을 사용하여 별도의 `string` 필드에 저장해야 합니다(두 필드를 `"|"`와 같은 고유 문자로 연결할 수도 있습니다).

날짜와 시간의 더 정교한 출력(형식 지정) 및 조작을 위해 널리 사용되는 JavaScript 라이브러리 중 하나를 사용하세요: [date-fns](https://date-fns.org/), [Day.js](https://day.js.org/), [Luxon](https://moment.github.io/luxon/) 또는 [Moment.js](https://momentjs.com/).
