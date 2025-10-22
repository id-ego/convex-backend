---
title: "Settings"
slug: "deployment-settings"
sidebar_position: 60
description:
  "Configure your Convex deployment settings including URLs, environment
  variables, authentication, backups, integrations, and deployment management."
---

[배포 설정 페이지](https://dashboard.convex.dev/deployment/settings)는 특정 배포(**프로덕션**, 개인 **개발** 배포 또는 **프리뷰** 배포)와 관련된 정보 및 구성 옵션에 대한 액세스를 제공합니다.

## URL 및 배포 키

[URL 및 배포 키 페이지](https://dashboard.convex.dev/deployment/settings)는 다음을 보여줍니다:

- 이 배포가 호스팅되는 URL. 일부 Convex 통합은 구성을 위해 배포 URL이 필요할 수 있습니다.
- 이 배포의 HTTP Actions가 전송되어야 하는 URL.
- 배포의 배포 키, [Netlify 및 Vercel과 같은 빌드 도구와의 통합](/production/hosting/hosting.mdx) 및 [Fivetran 및 Airbyte와의 데이터 동기화](/production/integrations/streaming-import-export.md)에 사용됩니다.

![Deployment Settings Dashboard Page](/screenshots/deployment_settings.png)

## 환경 변수

[환경 변수 페이지](https://dashboard.convex.dev/deployment/settings/environment-variables)를 통해 배포의 [환경 변수](/production/environment-variables.mdx)를 추가, 변경, 제거 및 복사할 수 있습니다.

![deployment settings environment variables page](/screenshots/deployment_settings_env_vars.png)

## 인증

[인증 페이지](https://dashboard.convex.dev/deployment/settings/authentication)는 사용자 [인증](/auth.mdx) 구현을 위해 `auth.config.js`에 구성된 값을 보여줍니다.

## 백업 및 복원

[백업 및 복원 페이지](https://dashboard.convex.dev/deployment/settings/backups)를 통해 배포의 데이터베이스 및 파일 저장소에 저장된 데이터를 [백업](/database/backup-restore.mdx)할 수 있습니다. 이 페이지에서 정기적인 백업을 예약할 수 있습니다.

![deployment settings export page](/screenshots/backups.png)

## 통합

통합 페이지를 통해 [로그 스트리밍](/production/integrations/integrations.mdx), [예외 보고](/production/integrations/integrations.mdx) 및 [스트리밍 내보내기](/production/integrations/streaming-import-export.md) 통합을 구성할 수 있습니다.

## 배포 일시 중지

[배포 일시 중지 페이지](https://dashboard.convex.dev/deployment/settings/pause-deployment)에서 일시 중지 버튼으로 [배포를 일시 중지](/production/pause-deployment.mdx)할 수 있습니다.

![deployment settings pause deployment page](/screenshots/deployment_settings_pause.png)
