---
title: "Projects"
slug: "projects"
sidebar_position: 10
description: "Create and manage Convex projects, settings, and deployments"
---

![Project settings](/screenshots/projects.png)

프로젝트는 Convex를 사용하는 코드베이스에 해당하며, 프로덕션 배포와 각 팀원을 위한 하나의 개인 배포가 포함됩니다.

[랜딩 페이지](https://dashboard.convex.dev)에서 프로젝트를 클릭하면 프로젝트 세부 정보로 리디렉션됩니다.

## 프로젝트 생성

프로젝트는 대시보드 또는 [CLI](/cli.md#create-a-new-project)에서 생성할 수 있습니다. 대시보드에서 프로젝트를 생성하려면 Create Project 버튼을 클릭하세요.

## 프로젝트 설정

프로젝트 페이지의 각 프로젝트 카드에서 트리플 닷 `⋮` 버튼을 클릭하여 프로젝트 수준 설정에 액세스할 수 있습니다.

![Project card menu](/screenshots/project_menu.png)

[프로젝트 설정 페이지](https://dashboard.convex.dev/project/settings)에서 다음을 수행할 수 있습니다:

- 프로젝트의 이름과 슬러그를 업데이트합니다.
- 프로젝트의 관리자를 관리합니다. 자세한 내용은 [역할 및 권한](/dashboard/teams.md#roles-and-permissions)을 참조하세요.
- 프로젝트가 소비한 [사용량 메트릭](/dashboard/teams.md#usage)의 양을 확인합니다.
- 프로덕션 배포를 위한 [커스텀 도메인](/production/hosting/custom.mdx#custom-domains)을 추가합니다.
- 프로덕션 및 프리뷰 배포에 대한 배포 키를 생성합니다.
- [기본 환경 변수](/production/environment-variables.mdx#project-environment-variable-defaults)를 생성하고 편집합니다.
- `CONVEX_DEPLOYMENT` 구성을 잃어버린 경우 프로젝트에 대한 액세스를 다시 얻기 위한 지침을 확인합니다.
- 프로젝트를 영구적으로 삭제합니다.

![Project settings](/screenshots/project_settings.png)

## 프로젝트 삭제

프로젝트를 삭제하려면 프로젝트 카드의 트리플 닷 `⋮` 버튼을 클릭하고 "Delete"를 선택하세요. 프로젝트 설정 페이지에서도 프로젝트를 삭제할 수 있습니다.

프로젝트가 삭제되면 복구할 수 없습니다. 프로젝트와 관련된 모든 배포 및 데이터가 영구적으로 제거됩니다. 대시보드에서 프로젝트를 삭제할 때 삭제를 확인하라는 메시지가 표시됩니다. 프로덕션 배포에 활동이 있는 프로젝트는 실수로 삭제되는 것을 방지하기 위해 추가 확인 단계가 있습니다.

![Delete project](/screenshots/project_delete.png)
