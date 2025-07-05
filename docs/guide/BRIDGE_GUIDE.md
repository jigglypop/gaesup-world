# Gaesup Bridge 가이드

## 1. Bridge 패턴의 목적

`Bridge`는 **Layer 1 (`ref`의 세계)**와 **Layer 2 (`Zustand`의 세계)** 사이의 **유일한 통신 채널**입니다. 이 패턴의 핵심 목적은 두 레이어를 완벽하게 분리(Decoupling)하여, 한쪽의 변경이 다른 쪽에 미치는 영향을 최소화하고 성능을 보장하는 것입니다.

-   **`ref`의 세계**: 60FPS로 변화하는 실시간 데이터.
-   **`Zustand`의 세계**: UI 렌더링을 위한 상태 데이터.

`Bridge`가 없다면 이 두 세계가 섞여 성능 저하와 데이터 불일치 문제를 야기합니다.

## 2. Bridge의 작동 원리: 명령(Command)과 스냅샷(Snapshot)

`Bridge`는 두 가지 종류의 단방향 통신만을 허용합니다.

### **1) 명령 (Command): Layer 2 → Layer 1**

-   **흐름**: `Hook(Layer 2)` → `Bridge` → `Engine/Ref(Layer 1)`
-   **역할**: `Hook`이 사용자 입력이나 로직에 따라 Layer 1의 객체를 조작해야 할 때 사용합니다.
-   **구현**: `Hook`은 `{ type: 'JUMP', force: 300 }`과 같은 **직렬화 가능한 순수 객체(Plain Object)**를 `Bridge`의 `execute` 메서드로 전달합니다. `Bridge`는 이 명령을 해석하여 등록된 `ref`에 `.applyImpulse()`와 같은 물리적 조작을 가합니다.

### **2) 스냅샷 (Snapshot): Layer 1 → Layer 2**

-   **흐름**: `Hook(Layer 2)` ← `Bridge` ← `Engine/Ref(Layer 1)`
-   **역할**: `Hook`이 Layer 1 객체의 현재 상태를 UI에 표시하거나 로직에 활용해야 할 때 사용합니다.
-   **구현**: `useFrame` 루프 내에서 `Hook`은 `Bridge`의 `snapshot` 메서드를 호출합니다. `Bridge`는 `ref`의 현재 상태(위치, 속도 등)를 읽어와 **`Object.freeze()` 처리된 읽기 전용 객체**를 반환합니다. `Hook`은 이 스냅샷을 `Zustand` 스토어에 저장합니다.

## 3. 표준 Bridge 인터페이스

모든 `Bridge`는 일관성을 위해 다음 `abstract class`를 상속받아 구현해야 합니다.

```typescript
// src/core/utils/BaseBridge.ts
export abstract class DomainBridge<RefType, CommandType, SnapshotType> {
  protected entities = new Map<string, RefType>();

  /**
   * Layer 2에서 Layer 1의 ref를 등록합니다.
   * @param id 엔티티의 고유 ID
   * @param ref Rapier, Three.js 등의 ref 객체
   */
  registerEntity(id: string, ref: RefType): void {
    this.entities.set(id, ref);
  }

  /**
   * 엔티티 등록을 해제합니다.
   * @param id 엔티티의 고유 ID
   */
  unregisterEntity(id: string): void {
    this.entities.delete(id);
  }

  /**
   * Layer 2의 명령을 받아 Layer 1의 객체를 조작합니다.
   * @param id 명령을 수행할 엔티티 ID
   * @param command 명령 객체
   */
  abstract execute(id: string, command: CommandType): void;

  /**
   * Layer 1 객체의 현재 상태를 읽기 전용 스냅샷으로 반환합니다.
   * @param id 스냅샷을 생성할 엔티티 ID
   */
  abstract snapshot(id: string): Readonly<SnapshotType> | null;
}
```

## 4. `MotionBridge` 구현 예시

```typescript
// src/core/motions/bridge/MotionBridge.ts
import { DomainBridge } from '@utils/BaseBridge';
import { RapierRigidBody } from '@react-three/rapier';
import { MotionCommand, MotionSnapshot } from './types';

export class MotionBridge extends DomainBridge<RapierRigidBody, MotionCommand, MotionSnapshot> {
  
  execute(id: string, command: MotionCommand): void {
    const body = this.entities.get(id);
    if (!body) return;

    switch (command.type) {
      case 'move':
        body.setLinvel(command.velocity, true);
        break;
      case 'jump':
        body.applyImpulse({ x: 0, y: command.force, z: 0 }, true);
        break;
      // ... 다른 명령들
    }
  }

  snapshot(id: string): Readonly<MotionSnapshot> | null {
    const body = this.entities.get(id);
    if (!body) return null;

    // 스냅샷은 항상 Object.freeze() 처리하여 불변성을 보장합니다.
    return Object.freeze({
      position: body.translation(),
      velocity: body.linvel(),
      rotation: body.rotation(),
      isMoving: body.linvel().length() > 0.1,
    });
  }
}
```

## 5. Bridge 작성 규칙

1.  **레이어 중립성**: `Bridge`는 순수 TypeScript 클래스여야 하며, **React/Zustand에 대한 의존성을 가져서는 안 됩니다.**
2.  **스냅샷은 불변**: `snapshot` 메서드는 항상 `Object.freeze()` 또는 `Readonly<T>`를 사용하여 읽기 전용 객체를 반환해야 합니다.
3.  **명령은 순수 객체**: `Command` 타입은 직렬화 가능한 단순 객체로 정의합니다.
4.  **직접 `ref` 노출 금지**: `Bridge`의 `protected entities`를 외부로 노출해서는 안 됩니다. 모든 접근은 `execute`와 `snapshot`을 통해 이루어져야 합니다.
5.  **싱글턴 관리**: `Bridge` 인스턴스는 전역적으로 하나만 존재하도록 관리하는 것이 일반적입니다. (e.g., `getGlobalMotionBridge()`) 