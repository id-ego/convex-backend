---
title: "dataModel.d.ts"
sidebar_position: 1
description: "데이터베이스 스키마 및 문서에 대한 생성된 TypeScript 타입"
---

<Admonition type="caution" title="이 코드는 생성된 것입니다">

이러한 내보내기는 `convex` 패키지에서 직접 사용할 수 없습니다!

대신 `npx convex dev`를 실행하여 `convex/_generated/dataModel.d.ts`를 생성해야 합니다.

</Admonition>

생성된 데이터 모델 타입입니다.

## 타입

### TableNames

Ƭ **TableNames**: `string`

모든 Convex 테이블의 이름입니다.

---

### Doc

Ƭ **Doc**`<TableName>`: `Object`

Convex에 저장된 문서의 타입입니다.

#### 타입 매개변수

| 이름        | 타입                                | 설명                                             |
| :---------- | :---------------------------------- | :------------------------------------------------------ |
| `TableName` | extends [`TableNames`](#tablenames) | 테이블 이름의 문자열 리터럴 타입("users"와 같은). |

---

### Id

Convex에서 문서의 식별자입니다.

Convex 문서는 `_id` 필드에서 액세스할 수 있는 `Id`로 고유하게 식별됩니다. 자세한 내용은 [문서 ID](/database/document-ids.mdx)를 참조하세요.

문서는 쿼리 및 뮤테이션 함수에서 `db.get(id)`를 사용하여 로드할 수 있습니다.

ID는 런타임에 단순히 문자열이지만, 이 타입은 타입 검사 시 다른 문자열과 구별하는 데 사용할 수 있습니다.

이것은 데이터 모델에 대해 타입이 지정된 [`GenericId`](/api/modules/values#genericid)의 별칭입니다.

#### 타입 매개변수

| 이름        | 타입                                | 설명                                             |
| :---------- | :---------------------------------- | :------------------------------------------------------ |
| `TableName` | extends [`TableNames`](#tablenames) | 테이블 이름의 문자열 리터럴 타입("users"와 같은). |

---

### DataModel

Ƭ **DataModel**: `Object`

Convex 데이터 모델을 설명하는 타입입니다.

이 타입에는 보유한 테이블, 해당 테이블에 저장된 문서의 타입 및 정의된 인덱스에 대한 정보가 포함됩니다.

이 타입은 [`queryGeneric`](/api/modules/server#querygeneric) 및 [`mutationGeneric`](/api/modules/server#mutationgeneric)과 같은 메서드를 타입 안전하게 만들기 위해 매개변수화하는 데 사용됩니다.
