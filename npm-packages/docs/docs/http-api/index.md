---
title: "Convex HTTP API"
sidebar_label: "Public HTTP API"
description: "HTTP로 직접 Convex에 연결하기"
---

import Tabs from "@theme/Tabs"; import TabItem from "@theme/TabItem";

배포를 정의하는 공개 함수는 공개 HTTP 엔드포인트에서 노출됩니다.

## Convex 값 형식

각 HTTP API는 문서가 어떻게 포맷되는지 설명하는 `format` 쿼리 매개변수를 받습니다. 현재 지원되는 값은 `json`뿐입니다. 자세한 내용은 [타입 페이지](/database/types#convex-values)를 참조하세요. 간단함을 위해 `json` 형식은 입력으로 모든 Convex 데이터 타입을 지원하지 않으며, 출력에서 여러 데이터 타입에 대해 중복된 표현을 사용합니다. 향후 모든 Convex 데이터 타입을 지원하는 새로운 형식을 추가할 예정입니다.

## API 인증

Functions API는 `Authorization` 헤더의 bearer 토큰을 통해 선택적으로 사용자로 인증될 수 있습니다. 값은 `Bearer <access_key>`이며, 여기서 키는 인증 공급자의 토큰입니다. Clerk에서 이것이 어떻게 작동하는지에 대한 자세한 내용은 Clerk 문서의 [내부 동작](/auth/clerk#under-the-hood) 부분을 참조하세요.

스트리밍 내보내기 및 스트리밍 가져오기 요청은 HTTP 헤더 `Authorization`을 통한 배포 관리자 권한이 필요합니다. 값은 `Convex <access_key>`이며, 여기서 액세스 키는 Convex 대시보드의 "Deploy key"에서 가져오며 Convex 데이터에 대한 전체 읽기 및 쓰기 액세스 권한을 제공합니다.

## Functions API

### POST `/api/query`, `/api/mutation`, `/api/action`

이 HTTP 엔드포인트를 사용하면 Convex 함수를 호출하고 결과를 값으로 받을 수 있습니다.

대시보드 [설정](/dashboard/deployments/settings.md) 페이지에서 백엔드 배포 URL을 찾을 수 있으며, API URL은 `<CONVEX_URL>/api/query` 등이 됩니다. 예를 들어:

<Tabs>
<TabItem value="shell" label="Shell">

```
curl https://acoustic-panther-728.convex.cloud/api/query \
   -d '{"path": "messages:list", "args": {}, "format": "json"}' \
   -H "Content-Type: application/json"
```

</TabItem>
<TabItem value="js" label="NodeJS">

```js
const url = "https://acoustic-panther-728.convex.cloud/api/query";
const request = { path: "messages:list", args: {}, format: "json" };

const response = fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(request),
});
```

</TabItem>
<TabItem value="py" label="Python">

```py
import requests

url = "https://acoustic-panther-728.convex.cloud/api/query"
headers = {"accept": "application/json"}
body = {"path": "messages:list", "args": {}, "format": "json"}

response = requests.post(url, headers=headers, json=body)
```

</TabItem>
</Tabs>

**JSON 본문 매개변수**

| 이름   | 타입   | 필수 | 설명                                                                                           |
| ------ | ------ | ---- | ---------------------------------------------------------------------------------------------- |
| path   | string | y    | [여기](/functions/query-functions#query-names)에 정의된 문자열로 포맷된 Convex 함수의 경로입니다. |
| args   | object | y    | Convex 함수에 전달할 명명된 인수 객체입니다.                                                      |
| format | string | n    | 값의 출력 형식입니다. 유효한 값: [`json`]                                                        |

**성공 시 결과 JSON**

| 필드 이름  | 타입         | 설명                                        |
| ---------- | ------------ | ------------------------------------------- |
| status     | string       | "success"                                   |
| value      | object       | 요청된 형식의 Convex 함수 결과입니다.          |
| logLines   | list[string] | 함수 실행 중 출력된 로그 라인입니다.           |

**오류 시 결과 JSON**

| 필드 이름    | 타입         | 설명                                                                                         |
| ------------ | ------------ | -------------------------------------------------------------------------------------------- |
| status       | string       | "error"                                                                                      |
| errorMessage | string       | 오류 메시지입니다.                                                                             |
| errorData    | object       | [애플리케이션 오류](/functions/error-handling/application-errors)가 발생한 경우 오류 데이터입니다. |
| logLines     | list[string] | 함수 실행 중 출력된 로그 라인입니다.                                                            |

### POST `/api/run/{functionIdentifier}`

이 HTTP 엔드포인트를 사용하면 요청 URL의 경로로 임의의 Convex 함수 타입을 호출하고 결과를 값으로 받을 수 있습니다. 함수 식별자는 [여기](/functions/query-functions#query-names)에 정의된 문자열로 포맷되며 `:`를 `/`로 대체합니다.

대시보드 [설정](/dashboard/deployments/settings.md) 페이지에서 백엔드 배포 URL을 찾을 수 있으며, API URL은 `<CONVEX_URL>/api/run/{functionIdentifier}` 등이 됩니다. 예를 들어:

<Tabs>
<TabItem value="shell" label="Shell">

```
curl https://acoustic-panther-728.convex.cloud/api/run/messages/list \
   -d '{"args": {}, "format": "json"}' \
   -H "Content-Type: application/json"
```

</TabItem>
<TabItem value="js" label="NodeJS">

```js
const url = "https://acoustic-panther-728.convex.cloud/api/run/messages/list";
const request = { args: {}, format: "json" };

const response = fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(request),
});
```

</TabItem>
<TabItem value="py" label="Python">

```py
import requests

url = "https://acoustic-panther-728.convex.cloud/api/run/messages/list"
headers = {"accept": "application/json"}
body = {"args": {}, "format": "json"}

response = requests.get(url, headers=headers, body=json)
```

</TabItem>
</Tabs>

**JSON 본문 매개변수**

| 이름   | 타입   | 필수 | 설명                                                      |
| ------ | ------ | ---- | --------------------------------------------------------- |
| args   | object | y    | Convex 함수에 전달할 명명된 인수 객체입니다.                 |
| format | string | n    | 값의 출력 형식입니다. 기본값은 `json`입니다. 유효한 값: [`json`] |

**성공 시 결과 JSON**

| 필드 이름  | 타입         | 설명                                        |
| ---------- | ------------ | ------------------------------------------- |
| status     | string       | "success"                                   |
| value      | object       | 요청된 형식의 Convex 함수 결과입니다.          |
| logLines   | list[string] | 함수 실행 중 출력된 로그 라인입니다.           |

**오류 시 결과 JSON**

| 필드 이름    | 타입         | 설명                                                                                         |
| ------------ | ------------ | -------------------------------------------------------------------------------------------- |
| status       | string       | "error"                                                                                      |
| errorMessage | string       | 오류 메시지입니다.                                                                             |
| errorData    | object       | [애플리케이션 오류](/functions/error-handling/application-errors)가 발생한 경우 오류 데이터입니다. |
| logLines     | list[string] | 함수 실행 중 출력된 로그 라인입니다.                                                            |
