---
sidebar_label: "인덱스와 쿼리 성능"
title: "인덱스와 쿼리 성능 소개"
sidebar_position: 100
description: "인덱스가 쿼리 성능에 미치는 영향 알아보기"
---

Convex [데이터베이스 쿼리](/database/reading-data/reading-data.mdx)가 빠르고 효율적인지 어떻게 확인할 수 있을까요? 언제 [인덱스](/database/reading-data/indexes/indexes.md)를 정의해야 할까요? 인덱스란 무엇일까요?

이 문서는 쿼리와 인덱스가 작동하는 방식에 대한 단순화된 모델을 설명하여 Convex에서 쿼리 성능에 대해 어떻게 생각해야 하는지 설명합니다.

데이터베이스 쿼리와 인덱스에 대한 강력한 이해가 있다면 참조 문서로 바로 이동할 수 있습니다:

- [데이터 읽기](/database/reading-data/reading-data.mdx)
- [인덱스](/database/reading-data/indexes/indexes.md)

## 문서 라이브러리

Convex가 문서를 물리적 책으로 저장하는 물리적 도서관이라고 상상해 볼 수 있습니다. 이 세계에서는 [`db.insert("books", {...})`](/api/interfaces/server.GenericDatabaseWriter#insert)로 Convex에 문서를 추가할 때마다 사서가 책을 선반에 배치합니다.

기본적으로 Convex는 삽입된 순서대로 문서를 구성합니다. 사서가 선반에 왼쪽에서 오른쪽으로 문서를 삽입한다고 상상할 수 있습니다.

다음과 같이 첫 번째 책을 찾는 쿼리를 실행하면:

```ts
const firstBook = await ctx.db.query("books").first();
```

사서는 선반의 왼쪽 끝에서 시작하여 첫 번째 책을 찾을 수 있습니다. 사서가 결과를 얻기 위해 단 하나의 책만 보면 되므로 이것은 매우 빠른 쿼리입니다.

마찬가지로 삽입된 마지막 책을 검색하려면 다음과 같이 할 수 있습니다:

```ts
const lastBook = await ctx.db.query("books").order("desc").first();
```

이것은 같은 쿼리이지만 순서를 내림차순으로 바꾼 것입니다. 도서관에서 이것은 사서가 선반의 오른쪽 끝에서 시작하여 오른쪽에서 왼쪽으로 스캔한다는 것을 의미합니다. 사서는 여전히 결과를 결정하기 위해 단 하나의 책만 보면 되므로 이 쿼리도 매우 빠릅니다.

## 전체 테이블 스캔

이제 누군가가 도서관에 와서 "제인 오스틴의 책이 무엇이 있나요?"라고 묻는다고 상상해보세요.

이것은 다음과 같이 표현할 수 있습니다:

```ts
const books = await ctx.db
  .query("books")
  .filter((q) => q.eq(q.field("author"), "Jane Austen"))
  .collect();
```

이 쿼리는 "모든 책을 왼쪽에서 오른쪽으로 살펴보고 `author` 필드가 Jane Austen인 책을 수집하라"고 말하는 것입니다. 이를 위해 사서는 전체 선반을 살펴보고 모든 책의 저자를 확인해야 합니다.

이 쿼리는 테이블의 모든 문서를 살펴봐야 하므로 _전체 테이블 스캔_입니다. 이 쿼리의 성능은 도서관의 책 수에 따라 달라집니다.

Convex 테이블에 문서 수가 적으면 괜찮습니다! 수백 개의 문서가 있으면 전체 테이블 스캔도 여전히 빠르지만, 테이블에 수천 개의 문서가 있으면 이러한 쿼리는 느려집니다.

도서관 비유에서 도서관에 선반이 하나만 있으면 이런 종류의 쿼리는 괜찮습니다. 도서관이 많은 선반이 있는 책장이나 많은 책장으로 확장되면 이 접근 방식은 비현실적이 됩니다.

## 카드 카탈로그

저자가 주어졌을 때 책을 더 효율적으로 찾으려면 어떻게 해야 할까요?

한 가지 옵션은 전체 도서관을 `author`로 다시 정렬하는 것입니다. 이것은 당면한 문제를 해결하지만 이제 `firstBook`과 `lastBook`에 대한 원래 쿼리는 전체 테이블 스캔이 됩니다. 왜냐하면 어떤 책이 먼저/마지막으로 삽입되었는지 보기 위해 모든 책을 검사해야 하기 때문입니다.

또 다른 옵션은 전체 도서관을 복제하는 것입니다. 모든 책의 사본 2부를 구입하여 2개의 별도 선반에 놓을 수 있습니다: 하나는 삽입 시간으로 정렬되고 다른 하나는 저자로 정렬됩니다. 이것은 작동하지만 비용이 많이 듭니다. 이제 도서관에 두 배의 공간이 필요합니다.

더 나은 옵션은 `author`에 대한 _인덱스_를 구축하는 것입니다. 도서관에서는 구식 [카드 카탈로그](https://en.wikipedia.org/wiki/Library_catalog)를 사용하여 저자별로 책을 정리할 수 있습니다. 여기서 아이디어는 사서가 각 책에 대해 다음을 포함하는 인덱스 카드를 작성하는 것입니다:

- 책의 저자
- 선반에서 책의 위치

이러한 인덱스 카드는 저자별로 정렬되어 책을 보관하는 선반과는 별도의 정리함에 보관됩니다. 카드 카탈로그는 책당 하나의 인덱스 카드만 있기 때문에 (책의 전체 텍스트가 아님) 작게 유지되어야 합니다.

![카드 카탈로그](/img/card-catalog.jpg)

이제 고객이 "제인 오스틴의 책"을 요청하면 사서는:

1. 카드 카탈로그로 가서 "제인 오스틴"에 대한 모든 카드를 빠르게 찾습니다.
2. 각 카드에 대해 선반에서 책을 찾습니다.

사서가 제인 오스틴의 인덱스 카드를 빠르게 찾을 수 있기 때문에 이것은 매우 빠릅니다. 각 카드에 대해 책을 찾는 것은 여전히 약간의 작업이지만 인덱스 카드의 수가 적으므로 매우 빠릅니다.

## 인덱스

데이터베이스 인덱스는 같은 개념을 기반으로 작동합니다! Convex를 사용하면 다음과 같이 _인덱스_를 정의할 수 있습니다:

```ts noDialect title="convex/schema.ts"
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    author: v.string(),
    title: v.string(),
    text: v.string(),
  }).index("by_author", ["author"]),
});
```

그러면 Convex는 `author`에 대한 `by_author`라는 새 인덱스를 생성합니다. 이것은 `books` 테이블에 이제 `author` 필드로 정렬된 추가 데이터 구조가 있음을 의미합니다.

다음과 같이 이 인덱스를 쿼리할 수 있습니다:

```ts
const austenBooks = await ctx.db
  .query("books")
  .withIndex("by_author", (q) => q.eq("author", "Jane Austen"))
  .collect();
```

이 쿼리는 Convex에게 `by_author` 인덱스로 가서 `doc.author === "Jane Austen"`인 모든 항목을 찾도록 지시합니다. 인덱스가 `author`로 정렬되어 있기 때문에 이것은 매우 효율적인 작업입니다. 이것은 Convex가 사서가 할 수 있는 것과 같은 방식으로 이 쿼리를 실행할 수 있음을 의미합니다:

1. 제인 오스틴의 항목이 있는 인덱스 범위를 찾습니다.
2. 해당 범위의 각 항목에 대해 해당 문서를 가져옵니다.

이 쿼리의 성능은 `doc.author === "Jane Austen"`인 문서 수에 따라 달라지며, 이는 매우 적어야 합니다. 쿼리 속도를 크게 향상시켰습니다!

## 인덱스 백필 및 유지 관리

생각해볼 흥미로운 세부 사항 중 하나는 이 새로운 구조를 만드는 데 필요한 작업입니다. 도서관에서 사서는 선반의 모든 책을 살펴보고 각 책에 대해 저자별로 정렬된 카드 카탈로그에 새 인덱스 카드를 넣어야 합니다. 그래야만 사서는 카드 카탈로그가 올바른 결과를 제공할 것이라고 신뢰할 수 있습니다.

Convex 인덱스도 마찬가지입니다! 새 인덱스를 정의하면 처음 `npx convex deploy`를 실행할 때 Convex는 모든 문서를 반복하고 각 문서를 인덱싱해야 합니다. 이것이 새 인덱스 생성 후 첫 번째 배포가 평소보다 약간 느린 이유입니다. Convex는 테이블의 각 문서에 대해 약간의 작업을 수행해야 합니다. 테이블이 특히 큰 경우 [단계적 인덱스](/database/reading-data/indexes#staged-indexes)를 사용하여 배포와 비동기적으로 백필을 완료하는 것을 고려하세요.

마찬가지로 인덱스가 정의된 후에도 Convex는 데이터가 변경됨에 따라 이 인덱스를 최신 상태로 유지하기 위해 약간의 추가 작업을 수행해야 합니다. 인덱싱된 테이블에서 문서가 삽입, 업데이트 또는 삭제될 때마다 Convex는 해당 인덱스 항목도 업데이트합니다. 이것은 사서가 새 책을 도서관에 추가할 때 새 책에 대한 새 인덱스 카드를 만드는 것과 유사합니다.

몇 개의 인덱스를 정의하는 경우 유지 관리 비용에 대해 걱정할 필요가 없습니다. 더 많은 인덱스를 정의하면 유지 관리 비용이 증가합니다. 왜냐하면 모든 `insert`가 모든 인덱스를 업데이트해야 하기 때문입니다. 이것이 Convex가 테이블당 32개의 인덱스 제한을 두는 이유입니다. 실제로 대부분의 애플리케이션은 중요한 쿼리를 효율적으로 만들기 위해 테이블당 몇 개의 인덱스를 정의합니다.

## 여러 필드 인덱싱

이제 고객이 도서관에 와서 아이작 아시모프의 _파운데이션_을 대출하고 싶다고 상상해보세요. `author`에 대한 인덱스가 주어지면 인덱스를 사용하여 아이작 아시모프의 모든 책을 찾은 다음 각 책의 제목을 검사하여 _파운데이션_인지 확인하는 쿼리를 작성할 수 있습니다.

```ts
const foundation = await ctx.db
  .query("books")
  .withIndex("by_author", (q) => q.eq("author", "Isaac Asimov"))
  .filter((q) => q.eq(q.field("title"), "Foundation"))
  .unique();
```

이 쿼리는 사서가 쿼리를 실행하는 방법을 설명합니다. 사서는 카드 카탈로그를 사용하여 아이작 아시모프의 책에 대한 모든 인덱스 카드를 찾습니다. 카드 자체에는 책의 제목이 없으므로 사서는 선반에서 모든 아시모프 책을 찾아 제목을 보고 _파운데이션_이라는 이름을 가진 책을 찾아야 합니다. 마지막으로 이 쿼리는 최대 하나의 결과를 기대하므로 [`.unique`](/api/interfaces/server.Query#unique)로 끝납니다.

이 쿼리는 [`withIndex`](/api/interfaces/server.QueryInitializer#withindex)를 사용한 필터링과 [`filter`](/api/interfaces/server.Query#filter)의 차이를 보여줍니다. `withIndex`는 인덱스를 기반으로 쿼리를 제한할 수만 있습니다. 특정 저자의 모든 문서를 찾는 것과 같이 인덱스가 효율적으로 수행할 수 있는 작업만 수행할 수 있습니다.

반면 `filter`는 임의의 복잡한 표현식을 작성할 수 있지만 인덱스를 사용하여 실행되지 않습니다. 대신 `filter` 표현식은 범위의 모든 문서에서 평가됩니다.

이 모든 것을 고려할 때, **인덱싱된 쿼리의 성능은 인덱스 범위에 있는 문서 수에 따라 달라진다**고 결론을 내릴 수 있습니다. 이 경우 성능은 아이작 아시모프 책의 수에 따라 달라집니다. 왜냐하면 사서는 각 책의 제목을 검사하기 위해 각 책을 봐야 하기 때문입니다.

불행히도 아이작 아시모프는 [많은 책](<https://en.wikipedia.org/wiki/Isaac_Asimov_bibliography_(alphabetical)>)을 썼습니다. 실제로 500권 이상의 책이 있어도 기존 인덱스를 사용하면 Convex에서 충분히 빠를 것이지만, 어쨌든 개선 방법을 고려해 봅시다.

한 가지 접근 방식은 `title`에 대한 별도의 `by_title` 인덱스를 구축하는 것입니다. 이렇게 하면 `.filter`와 `.withIndex`에서 수행하는 작업을 바꿔서 다음과 같이 할 수 있습니다:

```ts
const foundation = await ctx.db
  .query("books")
  .withIndex("by_title", (q) => q.eq("title", "Foundation"))
  .filter((q) => q.eq(q.field("author"), "Isaac Asimov"))
  .unique();
```

이 쿼리에서는 인덱스를 효율적으로 사용하여 _파운데이션_이라는 모든 책을 찾은 다음 필터링하여 아이작 아시모프의 책을 찾습니다.

이것은 괜찮지만 _파운데이션_이라는 제목을 가진 책이 너무 많아서 쿼리가 느려질 위험이 여전히 있습니다. 훨씬 더 나은 접근 방식은 `author`와 `title` 모두를 인덱싱하는 _복합_ 인덱스를 구축하는 것입니다. 복합 인덱스는 순서가 지정된 필드 목록에 대한 인덱스입니다.

```ts noDialect title="convex/schema.ts"
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    author: v.string(),
    title: v.string(),
    text: v.string(),
  }).index("by_author_title", ["author", "title"]),
});
```

이 인덱스에서 책은 먼저 저자로 정렬되고 각 저자 내에서 제목으로 정렬됩니다. 이것은 사서가 인덱스를 사용하여 아이작 아시모프 섹션으로 이동하고 그 안에서 _파운데이션_을 빠르게 찾을 수 있음을 의미합니다.

이것을 Convex 쿼리로 표현하면 다음과 같습니다:

```ts
const foundation = await ctx.db
  .query("books")
  .withIndex("by_author_title", (q) =>
    q.eq("author", "Isaac Asimov").eq("title", "Foundation"),
  )
  .unique();
```

여기서 인덱스 범위 표현식은 Convex에게 저자가 아이작 아시모프이고 제목이 _파운데이션_인 문서만 고려하도록 지시합니다. 이것은 단 하나의 문서이므로 이 쿼리는 매우 빠를 것입니다!

이 인덱스는 `author`로 먼저 정렬한 다음 `title`로 정렬하기 때문에 "아이작 아시모프의 F로 시작하는 모든 책"과 같은 쿼리도 효율적으로 지원합니다. 이것을 다음과 같이 표현할 수 있습니다:

```ts
const asimovBooksStartingWithF = await ctx.db
  .query("books")
  .withIndex("by_author_title", (q) =>
    q.eq("author", "Isaac Asimov").gte("title", "F").lt("title", "G"),
  )
  .collect();
```

이 쿼리는 인덱스를 사용하여 `author === "Isaac Asimov" && "F" <= title < "G"`인 책을 찾습니다. 다시 한 번, 이 쿼리의 성능은 인덱스 범위에 있는 문서 수에 따라 달라집니다. 이 경우 "F"로 시작하는 아시모프 책만 해당하며 매우 적습니다.

또한 이 인덱스는 "제인 오스틴의 책"에 대한 원래 쿼리도 지원합니다. 인덱스 범위 표현식에서 `author` 필드만 사용하고 제목으로 전혀 제한하지 않아도 괜찮습니다.

마지막으로, 도서관 고객이 _삼체_ 책을 요청하지만 저자의 이름을 모른다고 상상해 보세요. `by_author_title` 인덱스는 먼저 `author`로 정렬한 다음 `title`로 정렬하기 때문에 여기에 도움이 되지 않습니다. _삼체_라는 제목은 인덱스의 어디에나 나타날 수 있습니다!

`withIndex`의 Convex TypeScript 타입은 인덱스 필드를 순서대로 비교하도록 요구하여 이를 명확하게 합니다. 인덱스가 `["author", "title"]`로 정의되어 있기 때문에 `title` 전에 먼저 `.eq`로 `author`를 비교해야 합니다.

이 경우 이 쿼리를 용이하게 하기 위해 별도의 `by_title` 인덱스를 만드는 것이 가장 좋은 옵션일 것입니다.

## 결론

축하합니다! 이제 Convex 내에서 쿼리와 인덱스가 작동하는 방식을 이해했습니다!

다음은 우리가 다룬 주요 사항입니다:

1. 기본적으로 Convex 쿼리는 _전체 테이블 스캔_입니다. 이것은 프로토타이핑과 작은 테이블 쿼리에 적합합니다.
2. 테이블이 커지면 _인덱스_를 추가하여 쿼리 성능을 향상시킬 수 있습니다. 인덱스는 빠른 쿼리를 위해 문서를 정렬하는 별도의 데이터 구조입니다.
3. Convex에서 쿼리는 _`withIndex`_ 메서드를 사용하여 인덱스를 사용하는 쿼리 부분을 표현합니다. 쿼리의 성능은 인덱스 범위 표현식에 있는 문서 수에 따라 달라집니다.
4. Convex는 여러 필드를 인덱싱하는 _복합 인덱스_도 지원합니다.

쿼리와 인덱스에 대해 더 알아보려면 참조 문서를 확인하세요:

- [데이터 읽기](/database/reading-data/reading-data.mdx)
- [인덱스](/database/reading-data/indexes/indexes.md)
