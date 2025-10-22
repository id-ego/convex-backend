---
title: "Swift와 Convex 타입 변환"
sidebar_label: "데이터 타입"
hidden: false
sidebar_position: 5
description: "Swift 앱과 Convex 간의 타입 사용자 지정 및 변환"
---

## 사용자 정의 데이터 타입

Convex를 사용하면 백엔드에서 데이터를 TypeScript 객체로 쉽게 표현할 수 있으며, 쿼리, 뮤테이션 및 액션에서 이러한 객체를 반환할 수 있습니다. Swift 측에서 객체를 처리하려면 `Decodable` 프로토콜을 따르는 `struct` 정의를 만드세요. 모든 `Decodable` 멤버를 가진 모든 `struct`는 자동으로 준수할 수 있으므로 일반적으로 매우 간단합니다.

다음과 같은 JavaScript 객체를 반환하는 Convex 쿼리 함수를 고려해보세요:

```tsx
{
  name: "Guardians",
  uniformColors: ["blue", "white", "red"],
  wins: 80n,
  losses: 60n
}
```

이는 Swift에서 다음을 사용하여 표현할 수 있습니다:

```swift
struct BaseballTeam: Decodable {
  let name: String
  let uniformColors: [String]
  @ConvexInt
  var wins: Int
  @ConvexInt
  var losses: Int
}
```

그런 다음 subscribe 호출에서 yielding 인수로 해당 타입을 전달할 수 있습니다:

```swift
convex.subscribe(to: "mlb:first_place_team",
               with: ["division": "AL Central"],
           yielding: BaseballTeam.self)
```

원격 함수의 데이터가 사용자 정의 구조체로 역직렬화됩니다. 호출 컨텍스트에서 타입의 사용이 추론될 수 있는 경우가 많으며 yielding 인수를 건너뛸 수 있습니다.

## 숫자 타입

`Int` 및 `Double`과 같은 숫자 타입은 TypeScript 백엔드 함수와의 적절한 상호 운용을 보장하기 위해 특수 형식으로 인코딩됩니다. Swift 측에서 안전하게 사용하려면 다음 속성 래퍼 중 하나를 사용하세요.

| 타입                           | 래퍼                |
| ------------------------------ | ---------------------- |
| `Float` 또는 `Double`            | `@ConvexFloat`         |
| `Float?` 또는 `Double?`          | `@OptionalConvexFloat` |
| `Int` 또는 `Int32` 또는 `Int64`    | `@ConvexInt`           |
| `Int?` 또는 `Int32?` 또는 `Int64?` | `@OptionalConvexInt`   |

래퍼가 있는 `struct` 속성은 `var`로 선언해야 합니다.

## 필드 이름 변환

번역하거나 다른 이름으로 변환해야 하는 이름을 가진 객체를 코드가 수신하는 경우 `CodingKeys` `enum`을 사용하여 원격 이름을 구조체의 이름에 매핑하도록 지정할 수 있습니다. 예를 들어, 누군가가 들어오고 나간 시간을 나타내는 다음과 같은 로그 항목을 반환하는 백엔드 함수 또는 API를 상상해보세요:

```tsx
{name: "Bob", in: "2024-10-03 08:00:00", out: "2024-10-03 11:00:00"}
```

`in`은 Swift의 키워드이므로 해당 데이터는 `struct`로 직접 디코딩할 수 없습니다. `CodingKeys`를 사용하여 원래 이름에서 데이터를 수집하면서 대체 이름을 지정할 수 있습니다.

```swift
struct Log: Decodable {
  let name: String
  let inTime: String
  let outTime: String

  enum CodingKeys: String, CodingKey {
    case name
    case inTime = "in"
    case outTime = "out"
  }
}
```

## 모두 합치기

위의 사용자 정의 데이터 타입 예제에서 JavaScript의 `BigInt` 타입은 `wins` 및 `losses` 값에 후행 `n`을 추가하여 백엔드 데이터에서 사용되며, 이를 통해 Swift 코드가 `Int`를 사용할 수 있습니다. 대신 코드가 일반 JavaScript `number` 타입을 사용하는 경우 Swift 측에서는 부동 소수점 값으로 수신되고 `Int`로의 역직렬화가 실패합니다.

`number`가 사용되지만 관례상 정수 값만 포함하는 상황이 있는 경우 필드 이름 변환과 사용자 정의 속성을 사용하여 부동 소수점 표현을 숨겨서 `struct`에서 처리할 수 있습니다.

```swift
struct BaseballTeam: Decodable {
  let name: String
  let uniformColors: [String]
  @ConvexFloat
  private var internalWins: Double
  @ConvexFloat
  private var internalLosses: Double

  enum CodingKeys: String, CodingKey {
    case name
    case uniformColors
    case internalWins = "wins"
    case internalLosses = "losses"
  }

  // Double 값을 Int로 노출
  var wins: Int { Int(internalWins) }
  var losses: Int { Int(internalLosses) }
}
```

패턴은 `Double` 값을 비공개로 그리고 백엔드의 값과 다른 이름으로 저장하는 것입니다. 그런 다음 사용자 정의 속성을 추가하여 `Int` 값을 제공합니다.
