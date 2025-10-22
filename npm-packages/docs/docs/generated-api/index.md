---
title: 생성된 코드
description:
  "앱의 API에 특정한 자동 생성된 JavaScript 및 TypeScript 코드"
---

Convex는 코드 생성을 사용하여 앱의 데이터 모델 및 API에 특정한 코드를 생성합니다. Convex는 TypeScript 타입 정의(`.d.ts`)와 함께 JavaScript 파일(`.js`)을 생성합니다.

코드 생성은 Convex를 사용하는 데 필수는 아니지만, 생성된 코드를 사용하면 편집기에서 더 나은 자동 완성 기능을 제공하고 TypeScript를 사용하는 경우 더 많은 타입 안전성을 얻을 수 있습니다.

코드를 생성하려면 다음을 실행하세요:

```
npx convex dev
```

이렇게 하면 다음을 포함하는 `convex/_generated` 디렉토리가 생성됩니다:

- [`api.js` 및 `api.d.ts`](./api.md)
- [`dataModel.d.ts`](./data-model.md)
- [`server.js` 및 `server.d.ts`](./server.md)
