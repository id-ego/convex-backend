---
title: "iOS & macOS Swift"
sidebar_label: "Swift"
sidebar_position: 700
description: "Convex를 사용하는 iOS 및 macOS 애플리케이션을 위한 Swift 클라이언트 라이브러리"
---

Convex Swift 클라이언트 라이브러리는 iOS 또는 macOS 애플리케이션이 Convex 백엔드와 상호 작용할 수 있도록 합니다. 프론트엔드 코드에서 다음을 수행할 수 있습니다:

1. [쿼리](/functions/query-functions.mdx), [뮤테이션](/functions/mutation-functions.mdx) 및 [액션](/functions/actions.mdx) 호출하기
2. [Auth0](/auth/auth0.mdx)를 사용하여 사용자 인증하기

이 라이브러리는 오픈 소스이며 [GitHub에서 사용할 수 있습니다](https://github.com/get-convex/convex-swift).

시작하려면 [Swift 빠른 시작](/quickstart/swift.mdx)을 따르세요.

## 설치

Xcode의 iOS 또는 macOS 프로젝트의 경우, `ConvexMobile` 라이브러리에 종속성을 추가하기 위해 다음 단계를 수행해야 합니다.

1. 왼쪽 프로젝트 네비게이터에서 최상위 앱 컨테이너를 클릭합니다
2. PROJECT 제목 아래의 앱 이름을 클릭합니다
3. _Package Dependencies_ 탭을 클릭합니다
4. + 버튼을 클릭합니다

   ![Screenshot 2024-10-02 at 2.33.43 PM.png](/screenshots/swift_qs_step_2.png)

5. 검색 상자에 [`https://github.com/get-convex/convex-swift`](https://github.com/get-convex/convex-swift)를 붙여넣고 Enter를 누릅니다
6. `convex-swift` 패키지가 로드되면 Add Package 버튼을 클릭합니다
7. _Package Products_ 대화 상자에서 _Add to Target_ 드롭다운에서 제품 이름을 선택합니다
8. _Add Package_를 클릭합니다

## 백엔드에 연결하기

`ConvexClient`는 애플리케이션과 Convex 백엔드 간의 연결을 설정하고 유지하는 데 사용됩니다. 먼저 백엔드 배포 URL을 제공하여 클라이언트의 인스턴스를 생성해야 합니다:

```swift
import ConvexMobile

let convex = ConvexClient(deploymentUrl: "https://<your domain here>.convex.cloud")
```

애플리케이션 프로세스의 수명 동안 `ConvexClient`의 인스턴스를 하나 생성하고 사용해야 합니다. 위와 같이 전역 상수에 클라이언트를 저장할 수 있습니다. `ConvexClient`의 메서드를 호출할 때까지 Convex 백엔드에 대한 실제 연결이 시작되지 않습니다. 그 후에는 연결을 유지하고 연결이 끊어지면 다시 설정합니다.

## 데이터 가져오기

Swift Convex 라이브러리는 쿼리 결과에 대한 실시간 *구독*을 가능하게 하는 Convex 동기화 엔진에 대한 액세스를 제공합니다. `ConvexClient`의 `subscribe` 메서드로 쿼리를 구독하면 [`Publisher`](https://developer.apple.com/documentation/combine)가 반환됩니다. `Publisher`를 통해 사용 가능한 데이터는 쿼리를 지원하는 기본 데이터가 변경됨에 따라 시간이 지남에 따라 변경됩니다.

`Publisher`의 메서드를 호출하여 제공하는 데이터를 변환하고 소비할 수 있습니다.

`View`에서 문자열 목록을 반환하는 쿼리를 소비하는 간단한 방법은 목록을 포함하는 `@State`와 쿼리 결과를 `AsyncSequence`로 반복하는 코드가 있는 `.task` 수정자를 조합하는 것입니다:

```swift
struct ColorList: View {
  @State private var colors: [String] = []

  var body: some View {
    List {
      ForEach(colors, id: \.self) { color in
        Text(color)
      }
    }.task {
      let latestColors = convex.subscribe(to: "colors:get", yielding: [String].self)
        .replaceError(with: [])
        .values
      for await colors in latestColors {
        self.colors = colors
      }
    }
  }
}
```

백엔드 `"colors:get"` 쿼리를 지원하는 데이터가 변경될 때마다 새로운 `String` 값 배열이 `AsyncSequence`에 나타나고 `View`의 `colors` 목록에 새 데이터가 할당됩니다. 그러면 UI가 변경된 데이터를 반영하여 반응적으로 재구성됩니다.

### 쿼리 인수

`subscribe`에 인수를 전달할 수 있으며, 이는 관련 백엔드 `query` 함수에 제공됩니다. 인수는 문자열로 키가 지정된 Dictionary여야 하며 값은 일반적으로 기본 타입, 배열 및 기타 Dictionary여야 합니다.

```swift
let publisher = convex.subscribe(to: "colors:get",
                               with:["onlyFavorites": true],
                           yielding:[String].self)
```

`colors:get` 쿼리가 `onlyFavorites` 인수를 받는다고 가정하면, 값을 수신하고 쿼리 함수에서 논리를 수행하는 데 사용할 수 있습니다.

<Admonition type="tip">
[Decodable 구조체](/client/swift/data-types.md#custom-data-types)를 사용하여 Convex 객체를 Swift 구조체로 자동 변환하세요.
</Admonition>

<Admonition type="caution">
* Swift와 Convex 간에 [숫자를 주고받을 때](/client/swift/data-types.md#numerical-types) 중요한 주의사항이 있습니다.
* 백엔드 함수에 따라 [예약된 Swift 키워드](/client/swift/data-types.md#field-name-conversion)를 처리해야 할 수 있습니다.
</Admonition>

### 구독 수명

`subscribe`에서 반환된 `Publisher`는 관련 `View` 또는 `ObservableObject`가 존재하는 한 유지됩니다. 둘 중 하나가 더 이상 UI의 일부가 아니면 Convex에 대한 기본 쿼리 구독이 취소됩니다.

## 데이터 편집하기

`ConvexClient`의 `mutation` 메서드를 사용하여 백엔드 [뮤테이션](/functions/mutation-functions.mdx)을 트리거할 수 있습니다.

`mutation`은 `async` 메서드이므로 `Task` 내에서 호출해야 합니다. 뮤테이션은 값을 반환하거나 반환하지 않을 수 있습니다.

뮤테이션도 쿼리와 마찬가지로 인수를 받을 수 있습니다. 다음은 값을 반환하는 인수로 뮤테이션을 호출하는 예입니다:

```swift
let isColorAdded: Bool = try await convex.mutation("colors:put", with: ["color": newColor])
```

### 오류 처리

`mutation` 호출 중에 오류가 발생하면 예외가 발생합니다. 일반적으로 [`ConvexError`](/functions/error-handling/application-errors.mdx)와 `ServerError`를 포착하고 애플리케이션에 적합한 방식으로 처리할 수 있습니다.

다음은 색상이 이미 존재하는 경우 오류 메시지와 함께 `ConvexError`를 발생시킨 경우 `colors:put`의 오류를 처리하는 방법의 작은 예입니다.

```swift
do {
  try await convex.mutation("colors:put", with: ["color": newColor])
} catch ClientError.ConvexError(let data) {
  errorMessage = try! JSONDecoder().decode(String.self, from: Data(data.utf8))
  colorNotAdded = true
}
```

자세한 내용은 [오류 처리](/functions/error-handling/) 문서를 참조하세요.

## 타사 API 호출하기

`ConvexClient`의 `action` 메서드를 사용하여 백엔드 [액션](/functions/actions.mdx)을 트리거할 수 있습니다.

`action` 호출은 `mutation` 호출과 마찬가지로 인수를 받고, 값을 반환하고, 예외를 발생시킬 수 있습니다.

클라이언트 코드에서 액션을 호출할 수 있지만 항상 올바른 선택은 아닙니다. [클라이언트에서 액션 호출하기](/functions/actions.mdx#calling-actions-from-clients)에 대한 팁은 액션 문서를 참조하세요.

## Auth0를 사용한 인증

`ConvexClient` 대신 `ConvexClientWithAuth`를 사용하여 [Auth0](https://auth0.com/)로 인증을 구성할 수 있습니다. 이를 위해서는 `convex-swift-auth0` 라이브러리뿐만 아니라 Auth0 계정 및 애플리케이션 구성이 필요합니다.

자세한 설정 지침은 `convex-swift-auth0` 저장소의 [README](https://github.com/get-convex/convex-swift-auth0/blob/main/README.md)를 참조하고, Auth0용으로 구성된 [Workout 예제 앱](https://github.com/get-convex/ios-convex-workout)을 참조하세요. 전체 [Convex 인증 문서](/auth.mdx)도 좋은 리소스입니다.

다른 유사한 OpenID Connect 인증 공급자를 통합하는 것도 가능해야 합니다. 자세한 내용은 `convex-swift` 저장소의 [`AuthProvider`](https://github.com/get-convex/convex-swift/blob/c47aea414c92db2ccf3a0fa4f9db8caf2029b032/Sources/ConvexMobile/ConvexMobile.swift#L188) 프로토콜을 참조하세요.

## 프로덕션 및 개발 배포

앱의 [프로덕션](/production.mdx)으로 이동할 준비가 되면 Xcode 빌드 시스템을 설정하여 다른 빌드 대상이 다른 Convex 배포를 가리키도록 할 수 있습니다. 빌드 환경 구성은 매우 전문적이며, 귀하 또는 귀하의 팀이 다른 규칙을 가지고 있을 수 있지만 이것은 문제에 접근하는 한 가지 방법입니다.

1. 프로젝트 소스에 "Dev" 및 "Prod" 폴더를 만듭니다.
2. 각각에 다음과 같은 내용으로 `Env.swift` 파일을 추가합니다:

```swift
let deploymentUrl = "https://$DEV_OR_PROD.convex.cloud"
```

3. `Dev/Env.swift`에 개발 URL을, `Prod/Env.swift`에 프로덕션 URL을 입력합니다. Xcode가 `deploymentUrl`이 여러 번 정의되었다고 불평해도 걱정하지 마세요.
4. 왼쪽 탐색기 보기에서 최상위 프로젝트를 클릭합니다.
5. **TARGETS** 목록에서 빌드 대상을 선택합니다.
6. 대상의 이름을 "dev"로 끝나도록 변경합니다.
7. 마우스 오른쪽 버튼/Ctrl 클릭하여 복제하고 "prod"로 끝나는 이름을 지정합니다.
8. "dev" 대상을 선택한 상태에서 **Build Phases** 탭을 클릭합니다.
9. **Compile Sources** 섹션을 확장합니다.
10. `Prod/Env.swift`를 선택하고 - 버튼으로 제거합니다.
11. 마찬가지로 "prod" 대상을 열고 소스에서 `Dev/Env.swift`를 제거합니다.

![Screenshot 2024-10-03 at 1.34.34 PM.png](/screenshots/swift_env_setup.png)

이제 `ConvexClient`를 생성하는 곳마다 `deploymentUrl`을 참조할 수 있으며 빌드하는 대상에 따라 개발 또는 프로덕션 URL을 사용합니다.

## 애플리케이션 구조화하기

이 가이드에 표시된 예제는 간결하게 작성되었으며 전체 애플리케이션을 구조화하는 방법에 대한 지침을 제공하지 않습니다.

더 강력하고 계층화된 접근 방식을 원한다면 `ConvexClient`와 상호 작용하는 코드를 `ObservableObject`를 따르는 클래스에 넣으세요. 그러면 `View`가 해당 객체를 `@StateObject`로 관찰할 수 있으며 변경될 때마다 재구성됩니다.

예를 들어, 위의 `colors:get` 예제를 `ViewModel: ObservableObject` 클래스로 조정하면 `View`는 더 이상 데이터를 가져오는 데 직접적인 역할을 하지 않으며 `colors` 목록이 `ViewModel`에서 제공된다는 것만 알면 됩니다.

```swift
import SwiftUI

class ViewModel: ObservableObject {
  @Published var colors: [String] = []

  init() {
    convex.subscribe(to: "colors:get")
      .replaceError(with: [])
      .receive(on: DispatchQueue.main)
      .assign(to: &$colors)
  }
}

struct ContentView: View {
  @StateObject var viewModel = ViewModel()

  var body: some View {
    List {
      ForEach(viewModel.colors, id: \.self) { color in
        Text(color)
      }
    }
  }
}
```

필요와 앱의 규모에 따라 https://github.com/nalexn/clean-architecture-swiftui에서 설명하는 것과 같이 더 공식적인 구조를 제공하는 것이 합리적일 수 있습니다.

## 내부 작동 방식

Swift Convex 라이브러리는 공식 [Convex Rust 클라이언트](/client/rust.md) 위에 구축되었습니다. Convex 백엔드와의 WebSocket 연결을 유지하고 전체 Convex 프로토콜을 구현합니다.

`ConvexClient`의 모든 메서드 호출은 Rust 측의 Tokio 비동기 런타임을 통해 처리되며 애플리케이션의 메인 액터에서 안전하게 호출할 수 있습니다.
