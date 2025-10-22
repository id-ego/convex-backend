---
title: "api.js"
sidebar_position: 2
description:
  "Convex 함수 및 내부 호출을 위한 생성된 API 참조"
---

<Admonition type="caution" title="이 코드는 생성된 것입니다">

이러한 내보내기는 `convex` 패키지에서 직접 사용할 수 없습니다!

대신 `npx convex dev`를 실행하여 `convex/_generated/api.js` 및 `convex/_generated/api.d.ts`를 생성해야 합니다.

</Admonition>

이러한 타입은 앱에 대해 정의한 Convex 함수에 특정하기 때문에 코드 생성을 실행해야 합니다.

코드 생성을 사용하지 않는 경우 [`makeFunctionReference`](/api/modules/server#makefunctionreference)를 대신 사용할 수 있습니다.

### api

앱의 공개 Convex API를 설명하는 `API` 타입의 객체입니다.

이 `API` 타입에는 앱의 Convex 함수의 인수 및 반환 타입에 대한 정보가 포함됩니다.

api 객체는 클라이언트 측 React 훅 및 다른 함수를 실행하거나 예약하는 Convex 함수에서 사용됩니다.

```javascript title="src/App.jsx"
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

const data = useQuery(api.messages.list);
```

### internal

앱의 내부 Convex API를 설명하는 또 다른 `API` 타입의 객체입니다.

```js title="convex/upgrade.js"
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

export default action({
  handler: async ({ runMutation }, { planId, ... }) => {
    // Call out to payment provider (e.g. Stripe) to charge customer
    const response = await fetch(...);
    if (response.ok) {
      // Mark the plan as "professional" in the Convex DB
      await runMutation(internal.plans.markPlanAsProfessional, { planId });
    }
  },
});
```
