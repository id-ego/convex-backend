---
title: "인덱스"
sidebar_position: 100
description: "데이터베이스 인덱스로 쿼리 속도 향상하기"
---

인덱스는 Convex에게 문서를 구성하는 방법을 알려줌으로써 [문서 쿼리](/database/reading-data/reading-data.mdx#querying-documents)의 속도를 높일 수 있는 데이터 구조입니다. 인덱스를 사용하면 쿼리 결과의 문서 순서를 변경할 수도 있습니다.

인덱싱에 대한 더 자세한 소개는 [인덱스와 쿼리 성능](/database/reading-data/indexes/indexes-and-query-perf.md)을 참조하세요.

## 인덱스 정의하기

인덱스는 Convex [스키마](/database/schemas.mdx)의 일부로 정의됩니다. 각 인덱스는 다음으로 구성됩니다:

1. 이름.
   - 테이블당 고유해야 합니다.
2. 인덱싱할 필드의 순서가 지정된 목록.
   - 중첩된 문서의 필드를 지정하려면 `properties.name`과 같이 점으로 구분된 경로를 사용하세요.

테이블에 인덱스를 추가하려면 테이블 스키마에서 [`index`](/api/classes/server.TableDefinition#index) 메서드를 사용하세요:

```ts noDialect title="convex/schema.ts"
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// 두 개의 인덱스가 있는 messages 테이블을 정의합니다.
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    body: v.string(),
    user: v.id("users"),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_user", ["channel", "user"]),
});
```

`by_channel` 인덱스는 스키마에 정의된 `channel` 필드로 정렬됩니다. 같은 채널의 메시지의 경우 모든 인덱스에 자동으로 추가되는 [시스템 생성 `_creationTime` 필드](/database/types.md#system-fields)로 정렬됩니다.

반면 `by_channel_user` 인덱스는 같은 `channel`의 메시지를 메시지를 보낸 `user`로 정렬하고, 그 다음에야 `_creationTime`으로 정렬합니다.

인덱스는 [`npx convex dev`](/cli.md#run-the-convex-dev-server)와 [`npx convex deploy`](/cli.md#deploy-convex-functions-to-production)에서 생성됩니다.

인덱스를 정의하는 첫 번째 배포가 평소보다 약간 느리다는 것을 알 수 있습니다. 이는 Convex가 인덱스를 _백필_해야 하기 때문입니다. 테이블에 데이터가 많을수록 Convex가 인덱스 순서로 정리하는 데 더 오래 걸립니다. 대용량 테이블에 인덱스를 추가해야 하는 경우 [단계적 인덱스](#staged-indexes)를 사용하세요.

인덱스를 정의한 배포에서 인덱스를 자유롭게 쿼리할 수 있습니다. Convex는 새 쿼리 및 뮤테이션 함수가 등록되기 전에 인덱스가 백필되도록 보장합니다.

<Admonition type="caution" title="인덱스 제거 시 주의하세요">

새 인덱스를 추가하는 것 외에도 `npx convex deploy`는 스키마에 더 이상 존재하지 않는 인덱스를 삭제합니다. 스키마에서 인덱스를 제거하기 전에 완전히 사용되지 않는지 확인하세요!

</Admonition>

## 인덱스를 사용하여 문서 쿼리하기

`by_channel` 인덱스에서 "`channel`에서 1-2분 전에 생성된 메시지"에 대한 쿼리는 다음과 같습니다:

```ts
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .eq("channel", channel)
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
```

[`.withIndex`](/api/interfaces/server.QueryInitializer#withindex) 메서드는 쿼리할 인덱스와 Convex가 해당 인덱스를 사용하여 문서를 선택하는 방법을 정의합니다. 첫 번째 인수는 인덱스의 이름이고 두 번째는 _인덱스 범위 표현식_입니다. 인덱스 범위 표현식은 Convex가 쿼리를 실행할 때 고려해야 하는 문서에 대한 설명입니다.

인덱스 선택은 인덱스 범위 표현식을 작성하는 방법과 결과가 반환되는 순서에 모두 영향을 줍니다. 예를 들어, `by_channel`과 `by_channel_user` 인덱스를 모두 만들면 채널 내의 결과를 각각 `_creationTime` 또는 `user`로 정렬하여 얻을 수 있습니다. `by_channel_user` 인덱스를 다음과 같이 사용하면:

```ts
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel_user", (q) => q.eq("channel", channel))
  .collect();
```

결과는 `channel`의 모든 메시지가 `user`로 정렬된 다음 `_creationTime`으로 정렬됩니다. `by_channel_user`를 다음과 같이 사용하면:

```ts
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel_user", (q) =>
    q.eq("channel", channel).eq("user", user),
  )
  .collect();
```

결과는 주어진 `channel`에서 `user`가 보낸 메시지가 `_creationTime`으로 정렬됩니다.

인덱스 범위 표현식은 항상 다음의 연결된 목록입니다:

1. [`.eq`](/api/interfaces/server.IndexRangeBuilder#eq)로 정의된 0개 이상의 동등 표현식.
2. [선택사항] [`.gt`](/api/interfaces/server.IndexRangeBuilder#gt) 또는 [`.gte`](/api/interfaces/server.IndexRangeBuilder#gte)로 정의된 하한 표현식.
3. [선택사항] [`.lt`](/api/interfaces/server.IndexRangeBuilder#lt) 또는 [`.lte`](/api/interfaces/server.IndexRangeBuilder#lte)로 정의된 상한 표현식.

**필드를 인덱스 순서대로 단계별로 진행해야 합니다.**

각 동등 표현식은 처음부터 순서대로 다른 인덱스 필드를 비교해야 합니다. 상한과 하한은 동등 표현식을 따라야 하며 다음 필드를 비교해야 합니다.

예를 들어, 다음과 같은 쿼리를 작성하는 것은 불가능합니다:

```ts
// 컴파일되지 않습니다!
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
```

이 쿼리는 `by_channel` 인덱스가 `(channel, _creationTime)`으로 정렬되고 이 쿼리 범위가 먼저 단일 `channel`로 범위를 제한하지 않고 `_creationTime`에 대한 비교를 가지고 있기 때문에 유효하지 않습니다. 인덱스가 먼저 `channel`로 정렬된 다음 `_creationTime`으로 정렬되기 때문에 모든 채널에서 1-2분 전에 생성된 메시지를 찾는 데 유용한 인덱스가 아닙니다. `withIndex` 내의 TypeScript 타입이 이를 안내합니다.

어떤 인덱스에서 어떤 쿼리를 실행할 수 있는지 더 잘 이해하려면 [인덱스와 쿼리 성능 소개](/database/reading-data/indexes/indexes-and-query-perf.md)를 참조하세요.

**쿼리의 성능은 범위의 구체성에 따라 달라집니다.**

예를 들어, 쿼리가 다음과 같으면:

```ts
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .eq("channel", channel)
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
```

쿼리의 성능은 1-2분 전에 `channel`에서 생성된 메시지 수에 따라 달라집니다.

인덱스 범위가 지정되지 않으면 인덱스의 모든 문서가 쿼리에서 고려됩니다.

<Admonition type="tip" title="좋은 인덱스 범위 선택하기">

성능을 위해 가능한 한 구체적인 인덱스 범위를 정의하세요! 대용량 테이블을 쿼리하는데 `.eq`로 동등 조건을 추가할 수 없는 경우 새 인덱스를 정의하는 것을 고려해야 합니다.

</Admonition>

`.withIndex`는 Convex가 인덱스를 효율적으로 사용하여 찾을 수 있는 범위만 지정할 수 있도록 설계되었습니다. 다른 모든 필터링에는 [`.filter`](/api/interfaces/server.Query#filter) 메서드를 사용할 수 있습니다.

예를 들어 "`channel`에서 내가 생성하지 **않은** 메시지"를 쿼리하려면 다음과 같이 할 수 있습니다:

```ts
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", q => q.eq("channel", channel))
  .filter(q => q.neq(q.field("user"), myUserId)
  .collect();
```

이 경우 이 쿼리의 성능은 채널에 있는 메시지 수에 따라 달라집니다. Convex는 채널의 각 메시지를 고려하고 `user` 필드가 `myUserId`와 일치하는 메시지만 반환합니다.

## 인덱스로 정렬하기

`withIndex`를 사용하는 쿼리는 인덱스에 지정된 열로 정렬됩니다.

인덱스의 열 순서는 정렬 우선순위를 결정합니다. 인덱스에서 먼저 나열된 열의 값이 먼저 비교됩니다. 후속 열은 모든 이전 열이 일치하는 경우에만 타이브레이커로 비교됩니다.

Convex는 모든 인덱스의 마지막 열로 `_creationTime`을 자동으로 포함하므로, 인덱스의 다른 모든 열이 같으면 `_creationTime`이 항상 최종 타이브레이커가 됩니다.

예를 들어, `by_channel_user`는 `channel`, `user`, `\_creationTime`을 포함합니다. 따라서 `.withIndex("by_channel_user")`를 사용하는 `messages`에 대한 쿼리는 먼저 채널로 정렬되고, 각 채널 내에서 사용자로, 마지막으로 생성 시간으로 정렬됩니다.

인덱스로 정렬하면 상위 `N`명의 점수를 받은 사용자, 가장 최근 `N`개의 거래 또는 가장 많이 좋아요를 받은 `N`개의 메시지를 표시하는 등의 사용 사례를 충족할 수 있습니다.

예를 들어, 게임에서 상위 10명의 최고 점수 플레이어를 얻으려면 플레이어의 최고 점수에 대한 인덱스를 정의할 수 있습니다:

```ts
export default defineSchema({
  players: defineTable({
    username: v.string(),
    highestScore: v.number(),
  }).index("by_highest_score", ["highestScore"]),
});
```

그런 다음 인덱스와 [`take(10)`](/api/interfaces/server.Query#take)를 사용하여 상위 10명의 최고 점수 플레이어를 효율적으로 찾을 수 있습니다:

```ts
const topScoringPlayers = await ctx.db
  .query("users")
  .withIndex("by_highest_score")
  .order("desc")
  .take(10);
```

이 예제에서는 역대 최고 점수 플레이어를 찾고 있기 때문에 범위 표현식이 생략되었습니다. 이 특정 쿼리는 `take()`를 사용하기 때문에 대용량 데이터 세트에서도 합리적으로 효율적입니다.

범위 표현식 없이 인덱스를 사용하는 경우 항상 `withIndex`와 함께 다음 중 하나를 사용해야 합니다:

1. [`.first()`](/api/interfaces/server.Query#first)
2. [`.unique()`](/api/interfaces/server.Query#unique)
3. [`.take(n)`](/api/interfaces/server.Query#take)
4. [`.paginate(ops)`](/database/pagination.mdx)

이러한 API를 사용하면 전체 테이블 스캔을 수행하지 않고 쿼리를 합리적인 크기로 효율적으로 제한할 수 있습니다.

<Admonition type="caution" title="전체 테이블 스캔">

쿼리가 데이터베이스에서 문서를 가져올 때 지정한 범위의 행을 스캔합니다. 예를 들어 `.collect()`를 사용하는 경우 범위의 모든 행을 스캔합니다. 따라서 범위 표현식 없이 `withIndex`를 사용하면 [전체 테이블을 스캔](https://docs.convex.dev/database/indexes/indexes-and-query-perf#full-table-scans)하게 되며, 테이블에 수천 개의 행이 있을 때 느려질 수 있습니다. `.filter()`는 스캔되는 문서에 영향을 주지 않습니다. `.first()` 또는 `.unique()` 또는 `.take(n)`를 사용하면 충분한 문서를 얻을 때까지만 행을 스캔합니다.

</Admonition>

범위 표현식을 포함하여 더 타겟팅된 쿼리를 충족할 수 있습니다. 예를 들어, 캐나다에서 상위 점수를 받은 플레이어를 얻으려면 `take()`와 범위 표현식을 모두 사용할 수 있습니다:

```ts
// 캐나다에서 상위 10명의 최고 점수 플레이어를 쿼리합니다.
const topScoringPlayers = await ctx.db
  .query("users")
  .withIndex("by_country_highest_score", (q) => q.eq("country", "CA"))
  .order("desc")
  .take(10);
```

## 단계적 인덱스

기본적으로 인덱스 생성은 코드를 배포할 때 동기적으로 발생합니다. 대용량 테이블의 경우 기존 테이블에 대한 [인덱스 백필](indexes-and-query-perf#backfilling-and-maintaining-indexes) 프로세스가 느릴 수 있습니다. 단계적 인덱스는 배포를 차단하지 않고 대용량 테이블에 비동기적으로 인덱스를 생성하는 방법입니다. 여러 기능을 동시에 작업하는 경우 유용할 수 있습니다.

단계적 인덱스를 생성하려면 `schema.ts`에서 다음 구문을 사용하세요.

```ts
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
  }).index("by_channel", { fields: ["channel"], staged: true }),
});
```

<Admonition type="caution" title="단계적 인덱스는 활성화될 때까지 사용할 수 없습니다">

단계적 인덱스는 활성화할 때까지 쿼리에서 사용할 수 없습니다. 활성화하려면 먼저 백필이 완료되어야 합니다.

</Admonition>

대시보드 데이터 페이지의 [_인덱스_ 창](/dashboard/deployments/data/#view-the-indexes-of-a-table)을 통해 백필 진행 상황을 확인할 수 있습니다. 완료되면 `staged` 옵션을 제거하여 인덱스를 활성화하고 사용할 수 있습니다.

```ts
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
  }).index("by_channel", { fields: ["channel"] }),
});
```

## 제한

Convex는 최대 16개의 필드를 포함하는 인덱스를 지원합니다. 각 테이블에 32개의 인덱스를 정의할 수 있습니다. 인덱스에는 중복 필드를 포함할 수 없습니다.

인덱스에는 예약된 필드(`_`로 시작)를 사용할 수 없습니다. `_creationTime` 필드는 안정적인 정렬을 보장하기 위해 모든 인덱스의 끝에 자동으로 추가됩니다. 인덱스 정의에 명시적으로 추가해서는 안 되며 인덱스 필드 제한에 포함됩니다.

`by_creation_time` 인덱스는 자동으로 생성됩니다(인덱스를 지정하지 않은 데이터베이스 쿼리에서 사용됨). `by_id` 인덱스는 예약되어 있습니다.
