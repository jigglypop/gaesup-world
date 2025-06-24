# FSM 통합 및 도메인 연동 가이드

이 문서는 FSM(유한 상태 기계) 에디터에서 설계한 로직과 `motions`, `interactions` 등 여러 도메인의 실제 기능을 연동하는 방법을 정의합니다.

---

## 1. 공통 가이드

이 섹션은 FSM 시스템의 전체 아키텍처와 모든 도메인이 따라야 하는 핵심 원칙을 설명합니다.

### 1.1. 핵심 아키텍처: 에디터와 런타임의 분리

FSM 시스템은 두 개의 독립적인 영역으로 나뉩니다.

1.  **에디터 (Editor)**: 시각적인 노드 그래프를 만들고, 이를 순수한 **JSON 데이터**로 변환(컴파일)하는 역할만 합니다. 에디터는 `playAnimation`이라는 **문자열**만 알 뿐, 그 기능이 어떻게 구현되었는지는 알지 못합니다.
2.  **런타임 (Runtime)**: 에디터가 생성한 JSON 데이터를 해석하고, 게임 루프 내에서 실제 상태 전환과 액션을 실행합니다. 런타임은 `playAnimation` 문자열에 매핑된 **실제 함수**를 실행합니다.

이 둘을 연결하는 것이 바로 **레지스트리 패턴**입니다.

### 1.2. 레지스트리 패턴 (Registry Pattern)

레지스트리는 문자열 키(e.g., `"playAnimation"`)와 실제 함수(e.g., `(entity, args) => {...}`)를 연결하는 중앙 허브입니다.

-   **`actionRegistry`**: 게임 월드에 영향을 주는 동작(애니메이션 재생, 순찰 시작 등)을 등록합니다.
-   **`conditionRegistry`**: 상태 전환의 조건이 되는 함수(플레이어 근접 여부, 타이머 완료 등)를 등록합니다.

**파일 위치**: `src/core/fsm/registries.ts` (가칭)
```typescript
// src/core/fsm/registries.ts
type FsmAction = (target: any, args: any[]) => void;
type FsmCondition = (target: any, args: any[]) => boolean;

class Registry<T> {
  private store = new Map<string, T>();
  // ... register, get 메서드 구현 ...
}

export const actionRegistry = new Registry<FsmAction>();
export const conditionRegistry = new Registry<FsmCondition>();
```

### 1.3. 데이터 흐름

```
1. Editor UI          -> 2. FSM Compiler      -> 3. JSON Data
(문자열 입력)            (데이터 변환)            ("action": "playAnimation")
                                                    |
                                                    V
6. Domain Logic       <- 5. Registry          <- 4. FsmRunner
(실제 함수 실행)           (문자열->함수 조회)         (JSON 해석)
```

### 1.4. `FsmRunner`의 역할

-   1레이어의 순수 클래스 또는 훅으로 존재합니다.
-   컴파일된 FSM(JSON) 데이터를 받아 내부 상태를 관리합니다.
-   게임 루프(`useFrame`)에서 `update(target)`가 호출되면, 레지스트리를 조회하여 현재 상태에 맞는 조건과 액션을 실행합니다.
-   **의존성**: `FsmRunner`는 `registries`만 알고 있어야 하며, `motions`나 `interactions` 같은 특정 도메인을 직접 import해서는 안 됩니다.

---

## 2. 도메인별 구현 가이드

이 섹션은 `motions`, `interactions` 등 각 도메인이 자신의 기능을 FSM 시스템에서 사용할 수 있도록 등록하는 방법을 설명합니다.

### 2.1. 기본 원칙

-   각 도메인은 자신의 기능(액션, 조건)을 **중앙 레지스트리에 자발적으로 등록**할 책임이 있습니다.
-   등록된 함수는 FSM 에디터의 노드에서 **문자열 키**를 통해 즉시 사용할 수 있게 됩니다.

### 2.2. 액션(Action) 함수 구현 및 등록

게임 월드에 실질적인 변화를 주는 기능입니다.

1.  **함수 시그니처 준수**: 액션 함수는 반드시 `(target: any, args: any[]) => void` 시그니처를 따라야 합니다.
    -   `target`: FSM이 적용되는 대상 객체 (e.g., NPC, 상호작용 오브젝트).
    -   `args`: FSM 에디터의 노드에서 입력한 인자 배열.

2.  **함수 구현**:
    ```typescript
    // src/core/motions/actions/patrolActions.ts
    import { NpcObject } from '../types'; // 예시 타입

    export function startPatrol(target: NpcObject, args: any[]): void {
      const patrolPathName = args[0] as string;
      if (target.patrol) {
        target.patrol.setPath(patrolPathName);
        target.patrol.start();
      }
    }
    ```

3.  **레지스트리 등록**: 도메인의 진입점(`index.ts` 등)에서 `actionRegistry`에 함수를 등록합니다.
    ```typescript
    // src/core/motions/index.ts
    import { actionRegistry } from '../fsm/registries';
    import { startPatrol } from './actions/patrolActions';

    actionRegistry.register("startPatrol", startPatrol);
    ```

### 2.3. 조건(Condition) 함수 구현 및 등록

상태를 전환할지 말지를 결정하는 `true/false` 반환 함수입니다.

1.  **함수 시그니처 준수**: 조건 함수는 반드시 `(target: any, args: any[]) => boolean` 시그니처를 따라야 합니다.

2.  **함수 구현**:
    ```typescript
    // src/core/world/conditions/distanceConditions.ts
    import { NpcObject, PlayerObject } from '../types';

    export function isPlayerNearby(target: NpcObject, args: any[]): boolean {
      const distanceThreshold = args[0] as number;
      const player = getPlayerObject(); // 월드에서 플레이어 객체를 가져오는 함수 (가정)
      if (!player) return false;

      const distance = target.position.distanceTo(player.position);
      return distance < distanceThreshold;
    }
    ```

3.  **레지스트리 등록**:
    ```typescript
    // src/core/world/index.ts
    import { conditionRegistry } from '../fsm/registries';
    import { isPlayerNearby } from './conditions/distanceConditions';

    conditionRegistry.register("isPlayerNearby", isPlayerNearby);
    ```

### 2.4. 체크리스트

-   [ ] 액션/조건 함수의 시그니처를 올바르게 사용했는가?
-   [ ] 도메인 초기화 시점에 레지스트리에 함수를 등록했는가?
-   [ ] 등록한 문자열 키가 FSM 에디터에서 사용할 이름과 일치하는가?
-   [ ] 도메인 로직은 `FsmRunner`나 `editor`에 대해 알지 못하는가? (의존성 방향 준수) 