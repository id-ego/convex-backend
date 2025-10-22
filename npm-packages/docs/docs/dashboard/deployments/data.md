---
title: "Data"
slug: "data"
sidebar_position: 5
description:
  "View, edit, and manage database tables and documents in the dashboard"
---

![Data Dashboard Page](/screenshots/data.png)

[데이터 페이지](https://dashboard.convex.dev/deployment/data)를 통해 모든 테이블과 문서를 보고 관리할 수 있습니다.

페이지 왼쪽에는 테이블 목록이 있습니다. 테이블을 클릭하면 해당 테이블의 문서를 생성, 조회, 업데이트, 삭제할 수 있습니다.

각 테이블의 컬럼 헤더를 드래그 앤 드롭하여 데이터를 시각적으로 재정렬할 수 있습니다.

데이터 페이지의 읽기 전용 뷰는 [명령줄](/cli.md#display-data-from-tables)에서도 사용할 수 있습니다.

```sh
npx convex data [table]
```

## 문서 필터링

페이지 상단의 "Filter" 버튼을 클릭하여 데이터 페이지에서 문서를 필터링할 수 있습니다.

![Data filters](/screenshots/data_filters.png)

문서의 모든 필드는 Convex 쿼리 구문에서 지원하는 연산으로 필터링할 수 있습니다. [동등성](/database/reading-data/filters.mdx#equality-conditions) 및 [비교](/database/reading-data/filters.mdx#comparisons)는 Convex 클라이언트를 사용한 쿼리와 대시보드에서 필터링할 때 동일한 규칙을 따릅니다. 필드 타입을 기준으로도 필터링할 수 있습니다.

필터를 추가하려면 기존 필터 옆의 `+`를 클릭하세요. 두 개 이상의 조건을 추가하면 `and` 연산으로 평가됩니다.

각 필터에서는 필터링할 필드, 연산, 비교값을 선택해야 합니다. 세 번째 입력 상자(값 선택)에서는 `"a string"`, `123` 또는 `{ a: { b: 2 } }`와 같은 복잡한 객체 등 유효한 Convex 값을 입력할 수 있습니다.

<Admonition type="note">

`_creationTime`으로 필터링할 때는 일반 JavaScript 구문 입력 상자 대신 날짜 선택기가 표시됩니다. `_creationTime`에 대한 비교는 나노초 단위로 이루어지므로 정확한 시간으로 필터링하려면 `creationTime >= $time` 및 `creationTime <= $time + 1 minute`의 두 가지 필터 조건을 추가해 보세요.

</Admonition>

## 커스텀 쿼리 작성

대시보드에서 직접 [쿼리](/database/reading-data/reading-data.mdx)를 작성할 수 있습니다. 이를 통해 정렬, 조인, 그룹화 및 집계를 포함한 임의의 필터링 및 데이터 변환을 수행할 수 있습니다.

데이터 페이지 상단의 `⋮` 오버플로우 메뉴에서 "Custom query" 옵션을 클릭하세요.

<img
    src="/screenshots/data_custom_query.png"
    alt="Custom query button"
    width={250}
/>

이렇게 하면 [배포된 함수 실행](/dashboard/deployments/functions.md#running-functions)에 사용되는 것과 동일한 UI가 열리지만 "Custom test query" 옵션이 선택되어 쿼리의 소스 코드를 편집할 수 있습니다. 이 소스 코드는 배포로 전송되며 "Run Custom Query" 버튼을 클릭하면 실행됩니다.

![Running a custom test query](/screenshots/data_custom_query_runner.png)

데이터 페이지가 아닌 경우에도 모든 배포 페이지의 오른쪽 하단에 표시되는 지속적인 _fn_ 버튼을 통해 이 UI를 열 수 있습니다. 함수 러너를 여는 키보드 단축키는 Ctrl + ` (백틱)입니다.

## 테이블 생성

"Create Table" 버튼을 클릭하고 테이블의 새 이름을 입력하여 대시보드에서 테이블을 생성할 수 있습니다.

## 문서 생성

데이터 테이블의 도구 모음에 있는 "Add Documents" 버튼을 사용하여 테이블에 개별 문서를 추가할 수 있습니다.

"Add Documents"를 클릭하면 사이드 패널이 열리며 JavaScript 구문을 사용하여 테이블에 새 문서를 추가할 수 있습니다. 한 번에 두 개 이상의 문서를 추가하려면 편집기의 배열에 새 객체를 추가하세요.

![Add document](/screenshots/data_add_document.png)

## 빠른 작업 (컨텍스트 메뉴)

문서나 값을 마우스 오른쪽 버튼으로 클릭하여 컨텍스트 메뉴를 열고 값 복사, 선택한 값으로 빠르게 필터링, 문서 삭제 등의 빠른 작업을 수행할 수 있습니다.

![Quick actions context menu](/screenshots/data_context_menu.png)

## 셀 편집

셀의 값을 편집하려면 데이터 테이블에서 셀을 더블클릭하거나 선택된 상태에서 Enter 키를 누르세요. 화살표 키를 사용하여 선택된 셀을 변경할 수 있습니다.

인라인으로 편집하고 Enter 키를 눌러 저장하여 값을 변경할 수 있습니다.

<Admonition type="note">

[스키마](/database/schemas.mdx)를 만족하는 한 여기에서 값의 타입도 편집할 수 있습니다 — 문자열을 객체로 바꿔보세요!

</Admonition>

![Inline value editor](/screenshots/data_edit_inline.png)

## 문서 편집

문서의 여러 필드를 동시에 편집하려면 문서 위에 마우스를 올리고 마우스 오른쪽 버튼을 클릭하여 컨텍스트 메뉴를 엽니다. 거기에서 "Edit Document"를 클릭할 수 있습니다.

![Edit entire document](/screenshots/data_edit_document.png)

## 다른 문서에 대한 참조 추가

다른 문서를 참조하려면 참조하려는 문서의 문자열 ID를 사용하세요.

셀을 클릭하고 CTRL/CMD+C를 눌러 ID를 복사할 수 있습니다.

## 문서 일괄 편집

여러 문서 또는 모든 문서를 한 번에 편집할 수 있습니다. 모든 문서를 선택하려면 테이블 헤더 행의 체크박스를 클릭하세요. 개별 문서를 선택하려면 가장 왼쪽 셀 위에 마우스를 올리고 나타나는 체크박스를 클릭하세요. 인접한 여러 문서를 한 번에 선택하려면 체크박스를 클릭할 때 Shift 키를 누르세요.

하나 이상의 문서가 선택되면 테이블 도구 모음에 "(Bulk) Edit Document(s)" 버튼이 표시됩니다. 버튼을 클릭하면 오른쪽에 편집기가 나타납니다.

![Bulk edit documents](/screenshots/data_bulk_edit.png)

## 문서 삭제

하나 이상의 문서가 선택되면(위 참조) 테이블 도구 모음에 "Delete Document(s)" 버튼이 표시됩니다. 버튼을 클릭하여 문서를 삭제합니다. 프로덕션 배포에서 데이터를 편집하는 경우 문서가 삭제되기 전에 확인 대화 상자가 나타납니다.

## 테이블 비우기

데이터 페이지 상단의 `⋮` 오버플로우 메뉴를 클릭하고 "Clear Table"을 클릭하여 모든 문서를 삭제할 수도 있습니다. 이 작업은 테이블 자체를 삭제하지 않고 테이블의 모든 문서를 삭제합니다.

프로덕션 환경에서는 Convex 대시보드가 삭제 전에 테이블 이름을 입력하도록 요구합니다.

## 테이블 삭제

<Admonition type="caution" title="이것은 영구적인 작업입니다">

테이블 삭제는 되돌릴 수 없습니다. 프로덕션 환경에서는 Convex 대시보드가 삭제 전에 테이블 이름을 입력하도록 요구합니다.

</Admonition>

데이터 페이지 상단의 `⋮` 오버플로우 메뉴를 클릭하여 "Delete table" 버튼을 찾을 수 있습니다. 이 작업은 이 테이블의 모든 문서를 삭제하고 테이블 목록에서 테이블을 제거합니다. 이 테이블에 인덱스가 있는 경우 인덱스를 다시 만들려면 convex 함수를 재배포해야 합니다(프로덕션 또는 개발의 경우 각각 `npx convex deploy` 또는 `npx convex dev`를 실행).

## 스키마 생성

페이지 왼쪽 하단에는 "Generate Schema" 버튼이 있으며, 이를 클릭하여 Convex가 이 테이블 내의 모든 문서에 대한 [스키마](/database/schemas.mdx)를 생성하도록 할 수 있습니다.

![Generate Schema button](/screenshots/data_generate_schema.png)

## 테이블의 스키마 보기

데이터 페이지 상단의 `⋮` 오버플로우 메뉴를 클릭하여 "Schema" 버튼을 찾을 수 있습니다.

이 버튼을 클릭하면 선택한 테이블과 연결된 저장 및 생성된 [스키마](/database/schemas.mdx)를 보여주는 패널이 열립니다.

## 테이블의 인덱스 보기

데이터 페이지 상단의 `⋮` 오버플로우 메뉴를 클릭하여 "Indexes" 버튼을 찾을 수 있습니다.

이 버튼을 클릭하면 선택한 테이블과 연결된 [인덱스](/database/reading-data/indexes/indexes.md)를 보여주는 패널이 열립니다.

백필이 완료되지 않은 인덱스는 이름 옆에 로딩 스피너가 함께 표시됩니다.
