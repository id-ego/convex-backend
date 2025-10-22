---
title: "Logs"
slug: "logs"
sidebar_position: 40
description:
  "View real-time function logs and deployment activity in your dashboard"
---

![Logs Dashboard Page](/screenshots/logs.png)

[로그 페이지](https://dashboard.convex.dev/deployment/logs)는 배포 내에서 발생하는 모든 활동의 실시간 뷰입니다.

로그 페이지는 최근 함수 로그의 짧은 기록을 제공하며 생성되는 새 로그를 표시합니다. 더 긴 로그 기록을 저장하려면 [로그 스트림](/production/integrations/log-streams/log-streams.mdx)을 구성할 수 있습니다.

함수 활동에는 다음이 포함됩니다:

- 함수 실행 시간.
- 함수 실행의 요청 ID.
- 함수 실행의 결과(성공 또는 실패).
- 호출된 함수의 이름.
- 함수에 의해 로그된 모든 로그 라인(예: `console.log`)과 예외를 포함한 함수의 출력.
- 밀리초 단위의 함수 실행 기간(네트워크 지연 시간은 포함되지 않음).

함수 활동 외에도 구성 변경을 설명하는 [배포 이벤트](/dashboard/deployments/history.md)가 여기에 표시됩니다.

로그를 클릭하면 선택한 로그와 동일한 요청 ID와 관련된 모든 로그에 대한 뷰가 열립니다. 이는 오류를 디버깅하고 함수 실행의 컨텍스트를 이해하는 데 유용할 수 있습니다.

![Request ID Logs](/screenshots/request_logs.png)

이 페이지 상단의 컨트롤을 사용하여 텍스트, 함수 이름, 실행 상태 및 로그 심각도별로 로그를 필터링할 수 있습니다.

### 로그 필터링

페이지 상단의 "Filter logs..." 텍스트 상자를 사용하여 로그 텍스트를 필터링합니다.

"Functions" 드롭다운 목록을 사용하여 결과에서 함수를 포함하거나 제외할 수 있습니다.

"Filter logs"와 [Convex 요청 id](/functions/error-handling/error-handling.mdx#debugging-errors)를 사용하여 특정 오류에 대한 로그를 찾을 수도 있습니다. 예를 들어 브라우저 콘솔에서 이 `Error`를 보는 경우:

![Browser Error](/screenshots/console_error_requestid.png)

Convex 대시보드의 [로그](/dashboard/deployments/logs.md) 페이지에서 'Search logs...' 검색 표시줄에 해당 요청 ID를 붙여넣어 해당 함수의 로그를 볼 수 있습니다. 이 페이지는 로그의 완전한 기록 뷰가 아니므로 오래된 요청에 대한 로그를 찾지 못할 수 있습니다.

대부분의 오류 보고 서비스 및 로그 싱크도 요청 ID로 검색할 수 있어야 합니다.

### 로그 타입

로그는 타입별로도 필터링할 수 있습니다. 타입에는 함수 결과(성공 또는 실패)와 심각도 수준(info, warn, debug, error)이 포함됩니다.

모든 실패한 실행에는 이유가 포함되며, 일반적으로 JavaScript 예외입니다.
