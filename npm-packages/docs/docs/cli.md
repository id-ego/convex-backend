---
title: "CLI"
sidebar_position: 110
slug: "cli"
description: "Convex 프로젝트 및 함수 관리를 위한 명령줄 인터페이스"
---

Convex 명령줄 인터페이스(CLI)는 Convex 프로젝트 및 Convex 함수를 관리하기 위한 인터페이스입니다.

CLI를 설치하려면 다음을 실행하세요:

```sh
npm install convex
```

전체 명령 목록은 다음과 같이 볼 수 있습니다:

```sh
npx convex
```

## 구성

### 새 프로젝트 만들기

처음 실행할 때

```sh
npx convex dev
```

장치에 로그인하고 새 Convex 프로젝트를 만들라는 메시지가 표시됩니다. 그런 다음 다음을 생성합니다:

1. `convex/` 디렉토리: 쿼리 및 뮤테이션 함수의 홈입니다.
2. `CONVEX_DEPLOYMENT` 변수가 있는 `.env.local`: Convex 프로젝트의 주요 구성입니다. 개발 배포의 이름입니다.

### 프로젝트 구성 다시 만들기

실행

```sh
npx convex dev
```

`CONVEX_DEPLOYMENT`가 설정되지 않은 프로젝트 디렉토리에서 실행하여 새 프로젝트 또는 기존 프로젝트를 구성합니다.

### 로그아웃

```sh
npx convex logout
```

장치에서 기존 Convex 자격 증명을 제거하여 `npx convex dev`와 같은 후속 명령이 다른 Convex 계정을 사용할 수 있도록 합니다.

## 개발

### Convex 개발 서버 실행

```sh
npx convex dev
```

로컬 파일시스템을 감시합니다. [함수](/functions.mdx) 또는 [스키마](/database/schemas.mdx)를 변경하면 새 버전이 개발 배포로 푸시되고 `convex/_generated`의 [생성된 타입](/generated-api/)이 업데이트됩니다. 기본적으로 개발 배포의 로그가 터미널에 표시됩니다.

개발을 위해 [Convex 배포를 로컬에서 실행](/cli/local-deployments-for-dev.mdx)하는 것도 가능합니다.

### 대시보드 열기

```sh
npx convex dashboard
```

[Convex 대시보드](./dashboard)를 엽니다.

### 문서 열기

```sh
npx convex docs
```

이 문서로 돌아가세요!

### Convex 함수 실행

```sh
npx convex run <functionName> [args]
```

개발 배포에서 공개 또는 내부 Convex 쿼리, 뮤테이션 또는 액션을 실행합니다.

인수는 JSON 객체로 지정됩니다.

```sh
npx convex run messages:send '{"body": "hello", "author": "me"}'
```

쿼리 결과를 실시간으로 업데이트하려면 `--watch`를 추가하세요. 함수를 실행하기 전에 로컬 코드를 배포에 푸시하려면 `--push`를 추가하세요.

프로젝트의 프로덕션 배포에서 함수를 실행하려면 `--prod`를 사용하세요.

### 배포 로그 추적

개발 배포에서 콘솔로 로그를 파이프하는 방법을 선택할 수 있습니다:

```sh
# 모든 로그를 지속적으로 표시
npx convex dev --tail-logs always

# 동기화 문제를 확인하기 위해 배포 중 로그를 일시 중지 (기본값)
npx convex dev

# 개발 중 로그를 표시하지 않음
npx convex dev --tail-logs disable

# 배포 없이 로그 추적
npx convex logs
```

프로덕션 배포 로그를 대신 추적하려면 `npx convex logs`와 함께 `--prod`를 사용하세요.

### 파일에서 데이터 가져오기

```sh
npx convex import --table <tableName> <path>
npx convex import <path>.zip
```

설명 및 사용 사례를 참조하세요:
[데이터 가져오기](/database/import-export/import.mdx).

### 파일로 데이터 내보내기

```sh
npx convex export --path <directoryPath>
npx convex export --path <filePath>.zip
npx convex export --include-file-storage --path <path>
```

설명 및 사용 사례를 참조하세요:
[데이터 내보내기](/database/import-export/export.mdx).

### 테이블에서 데이터 표시

```sh
npx convex data  # 테이블 목록
npx convex data <table>
```

명령줄에서 [대시보드 데이터 페이지](/dashboard/deployments/data.md)의 간단한 보기를 표시합니다.

이 명령은 표시되는 데이터를 변경하기 위해 `--limit` 및 `--order` 플래그를 지원합니다. 더 복잡한 필터의 경우 대시보드 데이터 페이지를 사용하거나 [쿼리](/database/reading-data/reading-data.mdx)를 작성하세요.

`npx convex data <table>` 명령은 자신의 테이블 외에도 `_storage`와 같은 [시스템 테이블](/database/advanced/system-tables.mdx)과 함께 작동합니다.

### 환경 변수 읽기 및 쓰기

```sh
npx convex env list
npx convex env get <name>
npx convex env set <name> <value>
npx convex env remove <name>
```

대시보드 [환경 변수 설정 페이지](/dashboard/deployments/settings.md#environment-variables)에서 관리할 수 있는 배포 환경 변수를 확인하고 업데이트합니다.

## 배포

### Convex 함수를 프로덕션에 배포

```sh
npx convex deploy
```

푸시할 대상 배포는 다음과 같이 결정됩니다:

1. `CONVEX_DEPLOY_KEY` 환경 변수가 설정된 경우(CI에서 일반적), 해당 키와 연결된 배포입니다.
2. `CONVEX_DEPLOYMENT` 환경 변수가 설정된 경우(로컬 개발 중 일반적), 대상 배포는 `CONVEX_DEPLOYMENT`로 지정된 배포가 속한 프로젝트의 프로덕션 배포입니다. 이를 통해 개발 배포에 대해 개발하면서 프로덕션 배포에 배포할 수 있습니다.

이 명령은 다음을 수행합니다:

1. `--cmd`로 지정된 경우 명령을 실행합니다. 명령에는 CONVEX_URL(또는 유사한) 환경 변수를 사용할 수 있습니다:
   ```sh
   npx convex deploy --cmd "npm run build"
   ```
   `--cmd-url-env-var-name`으로 URL 환경 변수 이름을 사용자 정의할 수 있습니다:
   ```sh
   npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name CUSTOM_CONVEX_URL
   ```
1. Convex 함수를 타입 체크합니다.
1. `convex/_generated` 디렉토리에서 [생성된 코드](/generated-api/)를 재생성합니다.
1. Convex 함수와 그 종속성을 번들링합니다.
1. 함수, [인덱스](/database/reading-data/indexes/indexes.md), [스키마](/database/schemas.mdx)를 프로덕션에 푸시합니다.

이 명령이 성공하면 새 함수를 즉시 사용할 수 있습니다.

### Convex 함수를 [프리뷰 배포](/production/hosting/preview-deployments.mdx)에 배포

```sh
npx convex deploy
```

[프리뷰 배포 키](docs/cli/deploy-key-types.mdx#deploying-to-preview-deployments)가 포함된 `CONVEX_DEPLOY_KEY` 환경 변수와 함께 실행하면 이 명령은 다음을 수행합니다:

1. 새 Convex 배포를 만듭니다. `npx convex deploy`는 Vercel, Netlify, GitHub 및 GitLab 환경에 대한 Git 브랜치 이름을 추론하거나 `--preview-create` 옵션을 사용하여 새로 생성된 배포와 연결된 이름을 사용자 정의할 수 있습니다.
   ```
   npx convex deploy --preview-create my-branch-name
   ```
1. `--cmd`로 지정된 경우 명령을 실행합니다. 명령에는 CONVEX_URL(또는 유사한) 환경 변수를 사용할 수 있습니다:

   ```sh
   npx convex deploy --cmd "npm run build"
   ```

   `--cmd-url-env-var-name`으로 URL 환경 변수 이름을 사용자 정의할 수 있습니다:

   ```sh
   npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name CUSTOM_CONVEX_URL
   ```

1. Convex 함수를 타입 체크합니다.
1. `convex/_generated` 디렉토리에서 [생성된 코드](/generated-api/)를 재생성합니다.
1. Convex 함수와 그 종속성을 번들링합니다.
1. 함수, [인덱스](/database/reading-data/indexes/indexes.md), [스키마](/database/schemas.mdx)를 배포에 푸시합니다.
1. `--preview-run`으로 지정된 함수를 실행합니다(`npx convex dev`의 `--run` 옵션과 유사).

   ```sh
   npx convex deploy --preview-run myFunction
   ```

프론트엔드와 백엔드 프리뷰를 함께 설정하려면 [Vercel](/production/hosting/vercel.mdx#preview-deployments) 또는 [Netlify](/production/hosting/netlify.mdx#deploy-previews) 호스팅 가이드를 참조하세요.

### 생성된 코드 업데이트

```sh
npx convex codegen
```

`convex/_generated` 디렉토리의 [생성된 코드](/generated-api/)에는 TypeScript 타입 체크에 필요한 타입이 포함되어 있습니다. 이 코드는 `npx convex dev`를 실행하는 동안 필요할 때마다 생성되며, 이 코드는 저장소에 커밋되어야 합니다(이 코드 없이는 코드가 타입 체크되지 않습니다!).

코드를 재생성하는 것이 유용한 드문 경우(예: CI에서 올바른 코드가 체크인되었는지 확인)에는 이 명령을 사용할 수 있습니다.

코드를 생성하려면 Convex JavaScript 런타임에서 구성 파일을 평가하기 위해 convex 배포와 통신해야 할 수 있습니다. 이것은 배포에서 실행되는 코드를 수정하지 않습니다.
