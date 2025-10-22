---
title: "Android Kotlin"
sidebar_label: "Android Kotlin"
sidebar_position: 600
description:
  "Convex를 사용하는 모바일 애플리케이션을 위한 Android Kotlin 클라이언트 라이브러리"
---

Convex Android 클라이언트 라이브러리는 Android 애플리케이션이 Convex 백엔드와 상호작용할 수 있도록 합니다. 프론트엔드 코드에서 다음을 수행할 수 있습니다:

1. [쿼리](/functions/query-functions.mdx), [뮤테이션](/functions/mutation-functions.mdx) 및 [액션](/functions/actions.mdx)을 호출할 수 있습니다
2. [Auth0](/auth/auth0.mdx)를 사용하여 사용자를 인증할 수 있습니다

이 라이브러리는 오픈 소스이며
[GitHub에서 사용 가능합니다](https://github.com/get-convex/convex-mobile/tree/main/android).

시작하려면 [Android 빠른 시작](/quickstart/android.mdx)을 따라하세요.

## 설치

앱의 `build.gradle[.kts]` 파일에 다음과 같은 변경사항을 적용해야 합니다.

```kotlin
plugins {
    // ... existing plugins
    kotlin("plugin.serialization") version "1.9.0"
}

dependencies {
    // ... existing dependencies
    implementation("dev.convex:android-convexmobile:0.4.1@aar") {
        isTransitive = true
    }
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
}
```

이후 Gradle을 동기화하여 변경사항을 적용하세요. 이제 앱에서 Convex for Android 라이브러리와 코드와 Convex 백엔드 간 통신에 사용되는 Kotlin의 JSON 직렬화에 액세스할 수 있습니다.

## 백엔드에 연결하기

`ConvexClient`는 애플리케이션과 Convex 백엔드 간의 연결을 설정하고 유지하는 데 사용됩니다. 먼저 백엔드 배포 URL을 제공하여 클라이언트 인스턴스를 생성해야 합니다:

```kotlin
package com.example.convexapp

import dev.convex.android.ConvexClient

val convex = ConvexClient("https://<your domain here>.convex.cloud")
```

애플리케이션 프로세스의 수명 동안 하나의 `ConvexClient` 인스턴스를 생성하고 사용해야 합니다. 커스텀 Android
[`Application`](https://developer.android.com/reference/android/app/Application)
서브클래스를 생성하고 거기서 초기화하는 것이 편리할 수 있습니다:

```kotlin
package com.example.convexapp

import android.app.Application
import dev.convex.android.ConvexClient

class MyApplication : Application() {
    lateinit var convex: ConvexClient

    override fun onCreate() {
        super.onCreate()
        convex = ConvexClient("https://<your domain here>.convex.cloud")
    }
}
```

이렇게 하면 Jetpack Compose `@Composable` 함수에서 다음과 같이 클라이언트에 액세스할 수 있습니다:

```kotlin
val convex = (application as MyApplication).convex
```

## 데이터 가져오기

Convex for Android는 쿼리 결과에 대한 실시간 _구독_을 가능하게 하는 Convex
[리액터](https://docs.convex.dev/tutorial/reactor)에 대한 액세스를 제공합니다. `ConvexClient`의 `subscribe` 메서드로 쿼리를 구독하면 `Flow`가 반환됩니다. `Flow`의 내용은 쿼리를 뒷받침하는 기본 데이터가 변경됨에 따라 시간이 지나면서 변경됩니다.

`ConvexClient`의 모든 메서드는 일시 중단되며 `CoroutineScope` 또는 다른 `suspend` 함수에서 호출되어야 합니다. `@Composable`에서 문자열 목록을 반환하는 쿼리를 사용하는 간단한 방법은 목록을 포함하는 가변 상태와 `LaunchedEffect`의 조합을 사용하는 것입니다:

```kotlin
var workouts: List<String> by remember { mutableStateOf(listOf()) }
LaunchedEffect("onLaunch") {
    client.subscribe<List<String>>("workouts:get").collect { result ->
        result.onSuccess { receivedWorkouts ->
            workouts = receivedWorkouts
        }
    }
}
```

백엔드 `"workouts:get"` 쿼리를 구동하는 데이터가 변경될 때마다 새로운 `Result<List<String>>`이 `Flow`로 방출되고 `workouts` 목록이 새 데이터로 새로고침됩니다. `workouts`를 사용하는 모든 UI가 다시 빌드되어 완전히 반응형 UI를 제공합니다.

참고: [Android 아키텍처 패턴](https://developer.android.com/topic/architecture/data-layer)에 설명된 대로 구독 로직을 Repository로 래핑하는 것을 선호할 수 있습니다.

### 쿼리 인수

`subscribe`에 인수를 전달할 수 있으며 이는 연결된 백엔드 `query` 함수에 제공됩니다. 인수는 `Map<String, Any?>`로 타입이 지정됩니다. 맵의 값은 원시 값 또는 다른 맵과 목록이어야 합니다.

```kotlin
val favoriteColors = mapOf("favoriteColors" to listOf("blue", "red"))
client.subscribe<List<String>>("users:list", args = favoriteColors)
```

`favoriteColors` 인수를 받는 백엔드 쿼리가 있다고 가정하면, 쿼리 함수에서 값을 받아 로직을 수행하는 데 사용할 수 있습니다.

<Admonition type="tip">
직렬화 가능한 [Kotlin Data 클래스](/client/android/data-types.md#custom-data-types)를 사용하여 Convex 객체를 Kotlin 모델 클래스로 자동 변환하세요.
</Admonition>

<Admonition type="caution">
* Kotlin과 Convex 간에 [숫자를 주고받을 때](/client/android/data-types.md#numerical-types) 중요한 주의사항이 있습니다.
* `_`는 Kotlin에서 비공개 필드를 나타내는 데 사용됩니다. 경고 없이 `_creationTime` 및 `_id` Convex 필드를 직접 사용하려면 [Kotlin에서 필드 이름을 변환](/client/android/data-types.md#field-name-conversion)해야 합니다.
* 백엔드 함수에 따라 [예약된 Kotlin 키워드](/client/android/data-types.md#field-name-conversion)를 처리해야 할 수 있습니다.
</Admonition>

### 구독 수명

`subscribe`에서 반환된 `Flow`는 결과를 소비하기 위해 대기하는 무언가가 있는 한 지속됩니다. 구독이 있는 `@Composable` 또는 `ViewModel`이 범위를 벗어나면 Convex에 대한 기본 쿼리 구독이 취소됩니다.

## 데이터 편집

`ConvexClient`의 `mutation` 메서드를 사용하여 백엔드 [뮤테이션](https://docs.convex.dev/functions/mutation-functions)을 트리거할 수 있습니다.

다른 `suspend` 함수나 `CoroutineScope`에서 사용해야 합니다. 뮤테이션은 값을 반환하거나 반환하지 않을 수 있습니다. 응답에서 타입을 기대하는 경우 호출 시그니처에 이를 표시하세요.

뮤테이션은 쿼리와 마찬가지로 인수를 받을 수도 있습니다. 다음은 인수가 있는 뮤테이션에서 타입을 반환하는 예입니다:

```kotlin
val recordsDeleted = convex.mutation<@ConvexNum Int>(
  "messages:cleanup",
  args = mapOf("keepLatest" to 100)
)
```

`mutation` 호출 중 오류가 발생하면 예외가 발생합니다. 일반적으로
[`ConvexError`](https://docs.convex.dev/functions/error-handling/application-errors)
및 `ServerError`를 catch하고 애플리케이션에서 적절하게 처리할 수 있습니다.
자세한 내용은 [오류 처리](https://docs.convex.dev/functions/error-handling/) 문서를 참조하세요.

## 타사 API 호출

`ConvexClient`의 `action` 메서드를 사용하여 백엔드 [액션](https://docs.convex.dev/functions/actions)을 트리거할 수 있습니다.

`action` 호출은 `mutation` 호출과 마찬가지로 인수를 받고, 값을 반환하고, 예외를 발생시킬 수 있습니다.

Android에서 액션을 호출할 수 있지만 항상 올바른 선택은 아닙니다.
[클라이언트에서 액션 호출](https://docs.convex.dev/functions/actions#calling-actions-from-clients)에 대한 액션 문서의 팁을 참조하세요.

## Auth0를 사용한 인증

[Auth0](https://auth0.com/)를 사용하여 인증을 구성하려면 `ConvexClient` 대신 `ConvexClientWithAuth0`를 사용할 수 있습니다. 이를 위해서는 `convex-android-auth0` 라이브러리와 Auth0 계정 및 애플리케이션 구성이 필요합니다.

자세한 설정 지침은 `convex-android-auth0` 리포지토리의
[README](https://github.com/get-convex/convex-android-auth0/blob/main/README.md)를 참조하고, Auth0용으로 구성된
[Workout 예제 앱](https://github.com/get-convex/android-convex-workout)을 참조하세요. 전체
[Convex 인증 문서](https://docs.convex.dev/auth)도 좋은 리소스입니다.

다른 유사한 OpenID Connect 인증 공급자를 통합하는 것도 가능해야 합니다. 자세한 내용은 `convex-mobile` 리포지토리의
[`AuthProvider`](https://github.com/get-convex/convex-mobile/blob/5babd583631a7ff6d739e1a2ab542039fd532548/android/convexmobile/src/main/java/dev/convex/android/ConvexClient.kt#L291)
인터페이스를 참조하세요.

## 프로덕션 및 개발 배포

앱의 [프로덕션](https://docs.convex.dev/production)을 향해 나아갈 준비가 되면 Android 빌드 시스템을 설정하여 애플리케이션의 다른 빌드 또는 플레이버가 다른 Convex 배포를 가리키도록 할 수 있습니다. 비교적 간단한 방법 중 하나는 다른 빌드 타겟이나 플레이버에 다른 값(예: 배포 URL)을 전달하는 것입니다.

다음은 릴리스 및 디버그 빌드에 다른 배포 URL을 사용하는 간단한 예입니다:

```kotlin
// In the android section of build.gradle.kts:
buildTypes {
    release {
        // Snip various other config like ProGuard ...
        resValue("string", "convex_url", "YOUR_PROD.convex.cloud")
    }

    debug {
        resValue("string", "convex_url", "YOUR_DEV.convex.cloud")
    }
}
```

그런 다음 코드에서 단일 리소스를 사용하여 `ConvexClient`를 빌드할 수 있으며 컴파일 시 올바른 값을 얻게 됩니다.

```kotlin
val convex = ConvexClient(context.getString(R.string.convex_url))
```

<Admonition type="tip">
이러한 URL을 리포지토리에 체크인하고 싶지 않을 수 있습니다. 한 가지 패턴은 `.gitignore` 파일에서 무시하도록 구성된 커스텀 `my_app.properties` 파일을 생성하는 것입니다. 그런 다음 `build.gradle.kts` 파일에서 이 파일을 읽을 수 있습니다. 이 패턴이 사용되는 것을
[workout 샘플 앱](https://github.com/get-convex/android-convex-workout?tab=readme-ov-file#configuration)에서 볼 수 있습니다.
</Admonition>

## 애플리케이션 구조화

이 가이드에 표시된 예제는 간결하게 작성되었으며 전체 애플리케이션을 구조화하는 방법에 대한 지침을 제공하지 않습니다.

공식
[Android 애플리케이션 아키텍처](https://developer.android.com/topic/architecture/intro)
문서는 애플리케이션 빌드를 위한 모범 사례를 다루고 있으며, Convex에는 작은 다중 화면 애플리케이션이 어떻게 보일 수 있는지 보여주는
[샘플 오픈 소스 애플리케이션](https://github.com/get-convex/android-convex-workout/tree/main)도 있습니다.

일반적으로 다음을 수행하세요:

1. Flow와
   [단방향 데이터 흐름](https://developer.android.com/develop/ui/compose/architecture#udf)을 수용하세요
2. 명확한
   [데이터 레이어](https://developer.android.com/topic/architecture/data-layer)를 가지세요
   (데이터 소스로 `ConvexClient`와 함께 Repository 클래스 사용)
3. UI 상태를
   [ViewModel](https://developer.android.com/topic/architecture/recommendations#viewmodel)에 보관하세요

## 테스트

`ConvexClient`는 `open` 클래스이므로 단위 테스트에서 모킹하거나 페이크할 수 있습니다. 실제 클라이언트를 더 많이 사용하려면 `ConvexClient` 생성자에 페이크 `MobileConvexClientInterface`를 전달할 수 있습니다. 다만 Convex의 문서화되지 않은
[JSON 형식](https://github.com/get-convex/convex-mobile/blob/5babd583631a7ff6d739e1a2ab542039fd532548/android/convexmobile/src/main/java/dev/convex/android/jsonhelpers.kt#L47)으로 JSON을 제공해야 한다는 점에 유의하세요.

Android 계측 테스트에서 전체 `ConvexClient`를 사용할 수도 있습니다. 테스트용 특수 백엔드 인스턴스를 설정하거나 로컬 Convex 서버를 실행하고 전체 통합 테스트를 실행할 수 있습니다.

## 내부 동작

Convex for Android는 공식
[Convex Rust 클라이언트](https://docs.convex.dev/client/rust) 위에 구축되었습니다. Convex 백엔드와의 WebSocket 연결을 유지하고 전체 Convex 프로토콜을 구현합니다.

`ConvexClient`의 모든 메서드 호출은 Rust 측의 Tokio 비동기 런타임을 통해 처리되며 애플리케이션의 메인 스레드에서 안전하게 호출할 수 있습니다.

`ConvexClient`는 또한
[Kotlin의 직렬화 프레임워크](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/serialization-guide.md)를 많이 사용하며, 해당 프레임워크의 대부분의 기능을 애플리케이션에서 사용할 수 있습니다. 내부적으로 `ConvexClient`는 JSON
[`ignoreUnknownKeys`](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/json.md#ignoring-unknown-keys)
및
[`allowSpecialFloatingPointValues`](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/json.md#allowing-special-floating-point-values)
기능을 활성화합니다.
