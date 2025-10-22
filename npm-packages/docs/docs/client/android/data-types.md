---
title: "Kotlin과 Convex 타입 변환"
sidebar_label: "데이터 타입"
hidden: false
sidebar_position: 5
description:
  "Kotlin 앱과 Convex 간의 타입 커스터마이징 및 변환"
---

## 커스텀 데이터 타입

Convex에서 값을 받을 때 원시 값에만 제한되지 않습니다. 응답 데이터에서 자동으로 디코딩될 커스텀 `@Serializable` 클래스를 만들 수 있습니다.

다음과 같은 JavaScript 객체를 반환하는 Convex 쿼리 함수를 고려해보세요:

```jsx
{
	name: "Guardians",
	uniformColors: ["blue", "white", "red"],
	wins: 80n,
	losses: 60n
}
```

이는 Kotlin에서 다음과 같이 나타낼 수 있습니다:

```kotlin
@Serializable
data class BaseballTeam(
    val name: String,
    val uniformColors: List<String>,
    val wins: @ConvexNum Int,
    val losses: @ConvexNum Int)
```

그런 다음 `subscribe` 호출에서 타입 인수로 전달할 수 있습니다:

```kotlin
convex.subscribe<Team>("mlb:first_place_team", args = mapOf("division" to "AL Central"))
```

원격 함수의 데이터가 커스텀 클래스로 역직렬화됩니다.

## 숫자 타입

Convex 백엔드 코드는 JavaScript로 작성되며, 숫자 데이터를 위한 두 가지 비교적 일반적인 타입인 `number`와 `BigInt`가 있습니다.

`number`는 `42` 또는 `3.14`와 같이 값이 리터럴 숫자 값으로 할당될 때마다 사용됩니다. `BigInt`는 `42n`처럼 뒤에 `n`을 추가하여 사용할 수 있습니다. 두 타입에도 불구하고 JavaScript에서는 정수 또는 부동 소수점 값을 모두 보유하는 데 `number`를 사용하는 것이 매우 일반적입니다.

이 때문에 Convex는 정밀도를 잃지 않도록 값을 인코딩하는 데 특별한 주의를 기울입니다. 기술적으로 `number` 타입은 IEEE 754 부동 소수점 값이므로 Convex에서 일반 `number`를 얻을 때마다 Kotlin에서 부동 소수점으로 표현됩니다. 필요에 따라 `Double` 또는 `Float`를 사용할 수 있지만 `Float`는 원본에서 정밀도를 잃을 수 있음을 유의하세요.

또한 Kotlin의 `Long` 타입(64비트)은 `number`(정수를 인코딩하는 데 53비트만 사용 가능)에 안전하게 저장될 수 없으며 `BigInt`가 필요합니다.

이것은 Convex의 응답에서 숫자 값을 나타내기 위해 Kotlin에 커스텀 디코딩을 사용해야 한다는 힌트를 줘야 한다는 것을 설명하기 위한 긴 설명입니다.

이를 세 가지 방법으로 수행할 수 있습니다. 프로젝트에 가장 유용해 보이는 것을 사용하세요.

1. 일반 Kotlin 타입(`Int`, `Long`, `Float`, `Double`)에 `@ConvexNum`으로 주석을 답니다
2. 해당 타입에 제공된 타입 별칭을 사용합니다(`Int32`, `Int64`, `Float32`, `Float64`)
3. `@Serializable` 클래스를 정의하는 모든 파일의 맨 위에 특별한 주석을 포함하고 주석 없이 일반 타입만 사용합니다

   ```kotlin
   @file:UseSerializers(
       Int64ToIntDecoder::class,
       Int64ToLongDecoder::class,
       Float64ToFloatDecoder::class,
       Float64ToDoubleDecoder::class
   )

   package com.example.convexapp

   import kotlinx.serialization.UseSerializers

   // @Serializable classes and things.
   ```

예제에서 JavaScript의 `BigInt` 타입은 `wins` 및 `losses` 값에 뒤에 `n`을 추가하여 사용되어 Kotlin 코드에서 `Int`를 사용할 수 있습니다. 대신 코드에서 일반 JavaScript `number` 타입을 사용한 경우 Kotlin 측에서는 부동 소수점 값으로 받게 되고 역직렬화가 실패합니다.

`number`가 사용되지만 관례상 정수 값만 포함하는 경우와 같은 상황이 있다면 `@Serializable` 클래스에서 처리할 수 있습니다.

```kotlin
@Serializable
data class BaseballTeam(
    val name: String,
    val uniformColors: List<String>,
    @SerialName("wins") private val internalWins: Double,
    @SerialName("losses") private val internalLosses: Double) {

    // Expose the JavaScript number values as Ints.
    val wins get() = internalWins.toInt()
    val losses get() = internalLosses.toInt()
}
```

패턴은 `Double` 값을 비공개로 저장하고 백엔드의 값과 다른 이름으로 저장하는 것입니다. 그런 다음 액세서를 추가하여 `Int` 값을 제공합니다.

## 필드 이름 변환

이 패턴은 위에서 사용되었지만 자체적으로 설명할 가치가 있습니다. 때때로 값이 Kotlin 키워드와 일치하는 키로 백엔드에서 생성되거나(`{fun: true}`) Kotlin 명명 규칙을 따르지 않습니다(예: 밑줄로 시작). `@SerialName`을 사용하여 이러한 경우를 처리할 수 있습니다.

예를 들어, 백엔드 응답에서 Convex
[문서 ID](https://docs.convex.dev/database/document-ids)를 가져오고 Kotlin lint 경고를 트리거하지 않는 필드 이름으로 변환하는 방법은 다음과 같습니다:

```kotlin
@Serializable
data class ConvexDocument(@SerialName("_id") val id: String)
```
