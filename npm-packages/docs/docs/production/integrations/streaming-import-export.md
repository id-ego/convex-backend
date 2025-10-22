---
title: "Convex로 데이터 스트리밍 가져오기 및 내보내기"
sidebar_label: "스트리밍 가져오기/내보내기"
description: "Convex로 데이터 스트리밍 가져오기 및 내보내기"
sidebar_position: 4
---

[Fivetran](https://www.fivetran.com)과 [Airbyte](https://airbyte.com)는 Convex 데이터를 다른 데이터베이스와 동기화할 수 있는 데이터 통합 플랫폼입니다.

Fivetran은 Convex에서 [지원되는 대상](https://fivetran.com/docs/destinations)으로의 스트리밍 내보내기를 지원합니다. Convex 팀은 스트리밍 내보내기를 위한 Convex 소스 커넥터를 유지 관리합니다. Fivetran을 통한 Convex로의 스트리밍 가져오기는 현재 지원되지 않습니다.

Airbyte를 사용하면 [지원되는 소스](https://airbyte.com/connectors?connector-type=Sources)에서 Convex로의 스트리밍 가져오기와 Convex에서 [지원되는 대상](https://airbyte.com/connectors?connector-type=Destinations)으로의 스트리밍 내보내기가 가능합니다. Convex 팀은 스트리밍 내보내기를 위한 Convex 소스 커넥터와 스트리밍 가져오기를 위한 Convex 대상 커넥터를 유지 관리합니다.

<BetaAdmonition feature="Fivetran 및 Airbyte 통합" verb="are" />

## 스트리밍 내보내기

데이터 내보내기는 Convex에서 직접 지원하지 않는 워크로드를 처리하는 데 유용할 수 있습니다. 몇 가지 사용 사례는 다음과 같습니다:

1. 분석
   - Convex는 대량의 데이터를 로드하는 쿼리에 최적화되어 있지 않습니다. [Databricks](https://www.databricks.com) 또는 [Snowflake](https://www.snowflake.com/)와 같은 데이터 플랫폼이 더 적합합니다.
2. 유연한 쿼리
   - Convex는 강력한 [데이터베이스 쿼리](/database/reading-data/reading-data.mdx#querying-documents)와 내장된 [전체 텍스트 검색](/search.mdx) 지원을 제공하지만, Convex 내에서 작성하기 어려운 쿼리가 여전히 있습니다. "고급 검색" 보기와 같이 매우 동적인 정렬 및 필터링이 필요한 경우 [ElasticSearch](https://www.elastic.co)와 같은 데이터베이스가 도움이 될 수 있습니다.
3. 머신 러닝 학습
   - Convex는 계산 집약적인 머신 러닝 알고리즘을 실행하는 쿼리에 최적화되어 있지 않습니다.

<ProFeatureUpsell feature="스트리밍 내보내기" verb="requires" />

스트리밍 내보내기를 설정하는 방법을 알아보려면 [Fivetran](https://fivetran.com/integrations/convex) 또는 [Airbyte](https://docs.airbyte.com/integrations/sources/convex) 문서를 참조하세요. 도움이 필요하거나 질문이 있으면 [문의하세요](https://convex.dev/community).

## 스트리밍 가져오기

새로운 기술 도입은 특히 데이터베이스와 관련된 기술의 경우 느리고 어려운 프로세스일 수 있습니다. 스트리밍 가져오기를 사용하면 자체 마이그레이션 또는 데이터 동기화 도구를 작성하지 않고도 기존 스택과 함께 Convex를 도입할 수 있습니다. 몇 가지 사용 사례는 다음과 같습니다:

1. 자체 데이터를 사용하여 Convex가 프로젝트의 기존 백엔드를 대체할 수 있는지 프로토타입 제작
2. 기존 데이터베이스와 함께 Convex를 사용하여 새로운 제품을 더 빠르게 구축
3. 기존 데이터셋 위에 반응형 UI 레이어 개발
4. Convex로 데이터 마이그레이션([CLI](/cli.md) 도구가 요구 사항을 충족하지 않는 경우)

<Admonition type="caution" title="가져온 테이블을 읽기 전용으로 만들기">
일반적인 사용 사례는 Convex를 사용하여 새로운 것을 구축하기 위해 소스 데이터베이스의 테이블을 Convex에 "미러링"하는 것입니다. 결과를 소스 데이터베이스에 다시 동기화하면 위험한 쓰기 충돌이 발생할 수 있으므로 가져온 테이블을 Convex에서 읽기 전용으로 유지하는 것을 권장합니다. Convex는 아직 테이블이 읽기 전용임을 보장하는 액세스 제어를 제공하지 않지만, 코드에 가져온 테이블에 쓰는 mutation 또는 action이 없는지 확인하고 대시보드에서 가져온 테이블의 문서를 편집하지 않도록 할 수 있습니다.
</Admonition>

스트리밍 가져오기는 모든 Convex 플랜에 포함되어 있습니다. Convex 대상 커넥터를 설정하는 방법에 대한 Airbyte 문서는 [여기](https://docs.airbyte.com/integrations/destinations/convex)를 참조하세요.
