---
title: "배포 URL 설정"
slug: "deployment-urls"
sidebar_label: "배포 URL"
hidden: false
sidebar_position: 5
description: "Convex와 함께 실행되도록 프로젝트 구성하기"
---

[백엔드에 연결](/client/react.mdx#connecting-to-a-backend)할 때 배포 URL을 올바르게 구성하는 것이 중요합니다.

### Convex 프로젝트 생성하기

프로젝트 디렉토리에서 처음으로

```sh
npx convex dev
```

를 실행하면 새로운 Convex 프로젝트가 생성됩니다.

새 프로젝트에는 _production_과 _development_라는 두 개의 배포가 포함됩니다. _development_ 배포의 URL은 사용 중인 프론트엔드 프레임워크나 번들러에 따라 `.env.local` 또는 `.env` 파일에 저장됩니다.

Convex [대시보드](https://dashboard.convex.dev)의 [배포 설정](/dashboard/deployments/settings.md)을 방문하여 프로젝트의 모든 배포 URL을 확인할 수 있습니다.

### 클라이언트 구성하기

Convex 배포의 URL을 전달하여 Convex React 클라이언트를 생성합니다. 프론트엔드 애플리케이션에는 일반적으로 하나의 Convex 클라이언트만 있어야 합니다.

```jsx title="src/index.js"
import { ConvexProvider, ConvexReactClient } from "convex/react";

const deploymentURL = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(deploymentURL);
```

이 URL은 하드코딩할 수 있지만, 환경 변수를 사용하여 클라이언트가 연결할 배포를 결정하는 것이 편리합니다.

사용 중인 프론트엔드 프레임워크나 번들러에 따라 클라이언트 코드에서 접근 가능한 환경 변수 이름을 사용하세요.

### 환경 변수 이름 선택하기

프론트엔드 코드에서 비밀 환경 변수가 의도치 않게 노출되는 것을 방지하기 위해, 많은 번들러는 프론트엔드 코드에서 참조되는 환경 변수가 특정 접두사를 사용하도록 요구합니다.

[Vite](https://vitejs.dev/guide/env-and-mode.html)는 프론트엔드 코드에서 사용되는 환경 변수가 `VITE_`로 시작하도록 요구하므로 `VITE_CONVEX_URL`이 좋은 이름입니다.

[Create React App](https://create-react-app.dev/docs/adding-custom-environment-variables/)은 프론트엔드 코드에서 사용되는 환경 변수가 `REACT_APP_`로 시작하도록 요구하므로 위 코드는 `REACT_APP_CONVEX_URL`을 사용합니다.

[Next.js](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser)는 `NEXT_PUBLIC_`로 시작하도록 요구하므로 `NEXT_PUBLIC_CONVEX_URL`이 좋은 이름입니다.

번들러는 이러한 변수에 접근하는 다른 방법도 제공합니다. [Vite는 `import.meta.env.VARIABLE_NAME`을 사용](https://vitejs.dev/guide/env-and-mode.html)하는 반면, Next.js와 같은 다른 도구들은 Node.js와 유사한 [`process.env.VARIABLE_NAME`](https://nextjs.org/docs/basic-features/environment-variables)을 사용합니다.

```jsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
```

[`.env` 파일](https://www.npmjs.com/package/dotenv)은 개발 및 프로덕션 환경에서 서로 다른 환경 변수 값을 연결하는 일반적인 방법입니다. `npx convex dev`는 프로젝트가 사용하는 번들러를 추론하려고 시도하면서 해당 `.env` 파일에 배포 URL을 저장합니다.

```shell title=".env.local"
NEXT_PUBLIC_CONVEX_URL=https://guiltless-dog-960.convex.cloud

# 프론트엔드에 전달될 수 있는 다른 환경 변수의 예시
NEXT_PUBLIC_SENTRY_DSN=https://123abc@o123.ingest.sentry.io/1234
NEXT_PUBLIC_LAUNCHDARKLY_SDK_CLIENT_SIDE_ID=01234567890abcdef
```

백엔드 함수는 대시보드에서 구성된 [환경 변수](/production/environment-variables.mdx)를 사용할 수 있습니다. 백엔드 함수는 `.env` 파일에서 값을 가져오지 않습니다.
