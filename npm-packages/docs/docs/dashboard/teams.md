---
title: "Teams"
slug: "teams"
sidebar_position: 0
description:
  "Manage team settings, members, billing, and access control in Convex"
---

Convex에서 프로젝트는 팀별로 구성됩니다. 팀은 다른 사람들과 프로젝트에 대한 액세스를 공유하는 데 사용됩니다. Convex 대시보드 상단에 있는 팀 이름을 클릭하여 팀 간에 전환하거나 새 팀을 만들 수 있습니다. 그러면 프로젝트 선택기가 열리며, 팀 이름을 다시 클릭하여 팀을 전환할 수 있습니다.

![Team switcher](/screenshots/team_selector.png)

프로젝트 목록 페이지 상단에 있는 "Team Settings" 버튼을 클릭하여 팀 이름을 변경하거나 팀에 새 멤버를 초대할 수 있습니다.

## 일반

[일반 페이지](https://dashboard.convex.dev/team/settings)에서 팀 이름과 슬러그를 변경할 수 있습니다.

이 페이지에서 팀을 삭제할 수도 있습니다. 모든 프로젝트를 삭제하고 팀에서 다른 모든 팀 멤버를 제거한 후에만 팀을 삭제할 수 있습니다. 팀을 삭제하면 Convex 구독이 자동으로 취소됩니다.

![General team settings page](/screenshots/teams_general.png)

## 팀 멤버

[멤버 설정 페이지](https://dashboard.convex.dev/team/settings/members)를 사용하여 팀에서 멤버를 초대하거나 제거할 수 있습니다.

![Team members page](/screenshots/teams_members.png)

### 역할 및 권한

Convex에는 팀, 프로젝트 및 배포에 대한 액세스를 관리하기 위한 두 가지 수준의 제어가 있습니다. 팀 수준 역할은 사용자가 팀 내에서 수행할 수 있는 작업을 제어하고, 프로젝트 수준 권한은 사용자가 특정 프로젝트 내에서 수행할 수 있는 작업을 제어합니다.

#### 팀 역할

팀 멤버는 다음 역할 중 하나를 가질 수 있습니다:

- Admin
- Developer

팀 생성자는 자동으로 Admin 역할을 부여받습니다. 새 팀 멤버를 초대할 때 역할을 선택할 수 있습니다. 언제든지 팀 멤버의 역할을 변경할 수도 있습니다.

개발자는 다음을 수행할 수 있습니다:

- 새 프로젝트와 배포를 생성합니다. 새 프로젝트를 생성하면 프로젝트 생성자는 해당 프로젝트에 대해 자동으로 [프로젝트 관리자](#project-admins) 역할을 부여받습니다.
- 기존 프로젝트를 보고 이러한 프로젝트에 대한 개발 및 프리뷰 배포를 생성합니다. 개발자는 프로덕션 배포에서 데이터를 읽을 수 있지만 쓸 수는 없습니다.
- 팀의 사용량 및 청구 상태(이전 및 향후 청구서 등)를 봅니다

관리자는 개발자가 할 수 있는 모든 작업을 수행할 수 있으며 다음도 수행할 수 있습니다:

- 새 팀 멤버를 초대합니다
- 팀에서 멤버를 제거합니다
- 다른 팀 멤버의 역할을 변경합니다
- 팀의 Convex 구독 및 청구 세부 정보를 관리합니다.
- 팀 이름과 슬러그를 변경합니다
- 팀 관리자는 팀 내의 모든 프로젝트에 대한 프로젝트 관리자 액세스 권한도 암시적으로 부여받습니다. 자세한 내용은 [프로젝트 관리자](#project-admins)를 참조하세요.

#### 프로젝트 관리자

팀 역할 외에도 팀 멤버에게 "프로젝트 관리자" 역할을 부여하여 개별 프로젝트에 대한 관리자 액세스 권한을 부여할 수도 있습니다.

특정 프로젝트에 대한 프로젝트 관리자인 경우 다음을 수행할 수 있습니다:

- 프로젝트 이름과 슬러그를 업데이트합니다
- 프로젝트의 기본 환경 변수를 업데이트합니다
- 프로젝트를 삭제합니다
- 프로덕션 배포에 씁니다

멤버 설정 페이지에서 여러 프로젝트에 대한 프로젝트 관리자 역할을 동시에 할당하고 제거할 수 있습니다. 여러 멤버에 대한 프로젝트 관리자 역할을 동시에 할당하거나 제거하려면 대신 [프로젝트 설정](/dashboard/projects.md#project-settings) 페이지를 방문하세요.

## 청구

[청구 페이지](https://dashboard.convex.dev/team/settings/billing)를 사용하여 Convex 구독을 더 높은 계층으로 업그레이드하거나 기존 구독을 관리할 수 있습니다.

유료 플랜에서는 청구 연락처 세부 정보, 결제 방법을 업데이트하고 청구서를 볼 수도 있습니다.

[Convex 가격에 대해 자세히 알아보세요](https://www.convex.dev/pricing).

![Team billing page](/screenshots/teams_billing.png)

### 지출 한도

활성 Convex 구독이 있는 경우 [청구 페이지](https://dashboard.convex.dev/team/settings/billing)에서 팀의 지출 한도를 설정할 수 있습니다:

- **경고 임계값**은 소프트 제한일 뿐입니다: 초과하면 팀에 이메일로 알림이 전송되지만 다른 조치는 취해지지 않습니다.
- **비활성화 임계값**은 하드 제한입니다: 초과하면 팀의 모든 프로젝트가 비활성화됩니다. 이로 인해 프로젝트에서 함수를 실행하려고 할 때 오류가 발생합니다. 제한을 늘리거나 제거하여 프로젝트를 다시 활성화할 수 있습니다.

지출 한도는 플랜에 포함된 양을 초과하여 팀의 프로젝트에서 사용하는 리소스에만 적용됩니다. 시트 요금(팀의 각 개발자에 대해 지불하는 금액)은 제한에 포함되지 않습니다. 예를 들어 지출 한도를 $0/월로 설정하면 시트 요금만 청구되며 플랜에 포함된 기본 제공 리소스를 초과하면 프로젝트가 비활성화됩니다.

![The team billing page with some spending limits set.](/screenshots/teams_billing_spending_limits.png)

## 사용량

[사용량 페이지](https://dashboard.convex.dev/team/settings/usage)에서 팀이 소비한 모든 리소스와 플랜의 제한에 대한 추적 상황을 볼 수 있습니다.

[Convex 가격에 대해 자세히 알아보세요](https://www.convex.dev/pricing).

![Team usage page](/screenshots/teams_usage.png)

모든 메트릭은 일일 분석으로 제공됩니다:

![Team usage page graphs](/screenshots/teams_usage_2.png)

## 감사 로그

<Admonition type="info">

감사 로그는 Convex Professional에서만 사용할 수 있습니다.

</Admonition>

[감사 로그 페이지](https://dashboard.convex.dev/team/settings/audit-log)는 팀 내 멤버가 수행한 모든 작업을 보여줍니다. 여기에는 프로젝트 및 배포 생성 및 관리, 팀 멤버 초대 및 제거 등이 포함됩니다.

![Team audit log page](/screenshots/teams_audit_log.png)

[배포 히스토리 페이지](/dashboard/deployments/history.md)에서 배포 관련 이벤트의 히스토리도 볼 수 있습니다.
