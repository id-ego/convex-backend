---
title: "server.js"
sidebar_position: 4
description:
  "Convex 쿼리, 뮤테이션 및 액션 구현을 위한 생성된 유틸리티"
---

<Admonition type="caution" title="이 코드는 생성된 것입니다">

이러한 내보내기는 `convex` 패키지에서 직접 사용할 수 없습니다!

대신 `npx convex dev`를 실행하여 `convex/_generated/server.js` 및 `convex/_generated/server.d.ts`를 생성해야 합니다.

</Admonition>

서버 측 Convex 쿼리 및 뮤테이션 함수 구현을 위한 생성된 유틸리티입니다.

## 함수

### query

▸ **query**(`func`): [`RegisteredQuery`](/api/modules/server#registeredquery)

이 Convex 앱의 공개 API에서 쿼리를 정의합니다.

이 함수는 Convex 데이터베이스를 읽을 수 있으며 클라이언트에서 액세스할 수 있습니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`queryGeneric`](/api/modules/server#querygeneric)의 별칭입니다.

#### 매개변수

| 이름   | 설명                                                                             |
| :----- | :-------------------------------------------------------------------------------------- |
| `func` | 쿼리 함수입니다. 첫 번째 인수로 [QueryCtx](server.md#queryctx)를 받습니다. |

#### 반환값

[`RegisteredQuery`](/api/modules/server#registeredquery)

래핑된 쿼리입니다. 이름을 지정하고 액세스할 수 있도록 `export`로 포함하세요.

---

### internalQuery

▸ **internalQuery**(`func`):
[`RegisteredQuery`](/api/modules/server#registeredquery)

다른 Convex 함수에서만 액세스할 수 있는 쿼리를 정의합니다(클라이언트에서는 액세스할 수 없음).

이 함수는 Convex 데이터베이스에서 읽을 수 있습니다. 클라이언트에서는 액세스할 수 없습니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`internalQueryGeneric`](/api/modules/server#internalquerygeneric)의 별칭입니다.

#### 매개변수

| 이름   | 설명                                                                             |
| :----- | :-------------------------------------------------------------------------------------- |
| `func` | 쿼리 함수입니다. 첫 번째 인수로 [QueryCtx](server.md#queryctx)를 받습니다. |

#### 반환값

[`RegisteredQuery`](/api/modules/server#registeredquery)

래핑된 쿼리입니다. 이름을 지정하고 액세스할 수 있도록 `export`로 포함하세요.

---

### mutation

▸ **mutation**(`func`):
[`RegisteredMutation`](/api/modules/server#registeredmutation)

이 Convex 앱의 공개 API에서 뮤테이션을 정의합니다.

이 함수는 Convex 데이터베이스를 수정할 수 있으며 클라이언트에서 액세스할 수 있습니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`mutationGeneric`](/api/modules/server#mutationgeneric)의 별칭입니다.

#### 매개변수

| 이름   | 설명                                                                             |
| :----- | :-------------------------------------------------------------------------------------- |
| `func` | 뮤테이션 함수입니다. 첫 번째 인수로 [MutationCtx](#mutationctx)를 받습니다. |

#### 반환값

[`RegisteredMutation`](/api/modules/server#registeredmutation)

래핑된 뮤테이션입니다. 이름을 지정하고 액세스할 수 있도록 `export`로 포함하세요.

---

### internalMutation

▸ **internalMutation**(`func`):
[`RegisteredMutation`](/api/modules/server#registeredmutation)

다른 Convex 함수에서만 액세스할 수 있는 뮤테이션을 정의합니다(클라이언트에서는 액세스할 수 없음).

이 함수는 Convex 데이터베이스에서 읽고 쓸 수 있습니다. 클라이언트에서는 액세스할 수 없습니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`internalMutationGeneric`](/api/modules/server#internalmutationgeneric)의 별칭입니다.

#### 매개변수

| 이름   | 설명                                                                                      |
| :----- | :----------------------------------------------------------------------------------------------- |
| `func` | 뮤테이션 함수입니다. 첫 번째 인수로 [MutationCtx](server.md#mutationctx)를 받습니다. |

#### 반환값

[`RegisteredMutation`](/api/modules/server#registeredmutation)

래핑된 뮤테이션입니다. 이름을 지정하고 액세스할 수 있도록 `export`로 포함하세요.

---

### action

▸ **action**(`func`): [`RegisteredAction`](/api/modules/server#registeredaction)

이 Convex 앱의 공개 API에서 액션을 정의합니다.

액션은 비결정적 코드 및 제3자 서비스 호출과 같은 부작용이 있는 코드를 포함하여 모든 JavaScript 코드를 실행할 수 있는 함수입니다. Convex의 JavaScript 환경에서 실행하거나 `"use node"` 지시문을 사용하여 Node.js에서 실행할 수 있습니다. [`ActionCtx`](#actionctx)를 사용하여 쿼리 및 뮤테이션을 호출함으로써 데이터베이스와 간접적으로 상호 작용할 수 있습니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`actionGeneric`](/api/modules/server#actiongeneric)의 별칭입니다.

#### 매개변수

| 이름   | 설명                                                                        |
| :----- | :--------------------------------------------------------------------------------- |
| `func` | 액션 함수입니다. 첫 번째 인수로 [ActionCtx](#actionctx)를 받습니다. |

#### 반환값

[`RegisteredAction`](/api/modules/server#registeredaction)

래핑된 함수입니다. 이름을 지정하고 액세스할 수 있도록 `export`로 포함하세요.

---

### internalAction

▸ **internalAction**(`func`):
[`RegisteredAction`](/api/modules/server#registeredaction)

다른 Convex 함수에서만 액세스할 수 있는 액션을 정의합니다(클라이언트에서는 액세스할 수 없음).

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`internalActionGeneric`](/api/modules/server#internalactiongeneric)의 별칭입니다.

#### 매개변수

| 이름   | 설명                                                                                 |
| :----- | :------------------------------------------------------------------------------------------ |
| `func` | 액션 함수입니다. 첫 번째 인수로 [ActionCtx](server.md#actionctx)를 받습니다. |

#### 반환값

[`RegisteredAction`](/api/modules/server#registeredaction)

래핑된 액션입니다. 이름을 지정하고 액세스할 수 있도록 `export`로 포함하세요.

---

### httpAction

▸
**httpAction**(`func: (ctx: ActionCtx, request: Request) => Promise<Response>`):
[`PublicHttpAction`](/api/modules/server#publichttpaction)

#### 매개변수

| 이름   | 타입                                                      | 설명                                                                                                                                                                                         |
| :----- | :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `func` | `(ctx: ActionCtx, request: Request) => Promise<Response>` | 함수입니다. 첫 번째 인수로 [`ActionCtx`](/api/modules/server#actionctx)를, 두 번째 인수로 [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)를 받습니다. |

#### 반환값

[`PublicHttpAction`](/api/modules/server#publichttpaction)

래핑된 함수입니다. `convex/http.js`에서 이 함수를 가져와서 라우팅하여 연결하세요.

## 타입

### QueryCtx

Ƭ **QueryCtx**: `Object`

Convex 쿼리 함수 내에서 사용하기 위한 서비스 집합입니다.

쿼리 컨텍스트는 서버에서 실행되는 모든 Convex 쿼리 함수에 첫 번째 인수로 전달됩니다.

이것은 모든 서비스가 읽기 전용이기 때문에 [MutationCtx](#mutationctx)와 다릅니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx)의 별칭입니다.

#### 타입 선언

| 이름      | 타입                                                       |
| :-------- | :--------------------------------------------------------- |
| `db`      | [`DatabaseReader`](#databasereader)                        |
| `auth`    | [`Auth`](/api/interfaces/server.Auth.md)                   |
| `storage` | [`StorageReader`](/api/interfaces/server.StorageReader.md) |

---

### MutationCtx

Ƭ **MutationCtx**: `Object`

Convex 뮤테이션 함수 내에서 사용하기 위한 서비스 집합입니다.

뮤테이션 컨텍스트는 서버에서 실행되는 모든 Convex 뮤테이션 함수에 첫 번째 인수로 전달됩니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx)의 별칭입니다.

#### 타입 선언

| 이름        | 타입                                                       |
| :---------- | :--------------------------------------------------------- |
| `db`        | [`DatabaseWriter`](#databasewriter)                        |
| `auth`      | [`Auth`](/api/interfaces/server.Auth.md)                   |
| `storage`   | [`StorageWriter`](/api/interfaces/server.StorageWriter.md) |
| `scheduler` | [`Scheduler`](/api/interfaces/server.Scheduler.md)         |

---

### ActionCtx

Ƭ **ActionCtx**: `Object`

Convex 액션 함수 내에서 사용하기 위한 서비스 집합입니다.

액션 컨텍스트는 서버에서 실행되는 모든 Convex 액션 함수에 첫 번째 인수로 전달됩니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`ActionCtx`](/api/modules/server#actionctx)의 별칭입니다.

#### 타입 선언

| 이름           | 타입                                                                                                                                                                         |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runQuery`     | (`name`: `string`, `args`?: `Record<string, Value>`) => `Promise<Value>`                                                                                                     |
| `runMutation`  | (`name`: `string`, `args`?: `Record<string, Value>`) => `Promise<Value>`                                                                                                     |
| `runAction`    | (`name`: `string`, `args`?: `Record<string, Value>`) => `Promise<Value>`                                                                                                     |
| `auth`         | [`Auth`](/api/interfaces/server.Auth.md)                                                                                                                                     |
| `scheduler`    | [`Scheduler`](/api/interfaces/server.Scheduler.md)                                                                                                                           |
| `storage`      | [`StorageActionWriter`](/api/interfaces/server.StorageActionWriter.md)                                                                                                       |
| `vectorSearch` | (`tableName`: `string`, `indexName`: `string`, `query`: [`VectorSearchQuery`](/api/interfaces/server.VectorSearchQuery.md)) => `Promise<Array<{ _id: Id, _score: number }>>` |

---

### DatabaseReader

Convex 쿼리 함수 내에서 데이터베이스를 읽기 위한 인터페이스입니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`GenericDatabaseReader`](/api/interfaces/server.GenericDatabaseReader)의 별칭입니다.

---

### DatabaseWriter

Convex 뮤테이션 함수 내에서 데이터베이스를 읽고 쓰기 위한 인터페이스입니다.

이것은 앱의 데이터 모델에 대해 타입이 지정된 [`GenericDatabaseWriter`](/api/interfaces/server.GenericDatabaseWriter)의 별칭입니다.
