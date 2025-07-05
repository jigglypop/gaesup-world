# Boilerplate 사용 가이드

이 가이드는 `src/core/boilerplate`의 재사용 가능한 템플릿을 사용하여 새로운 도메인(e.g., `motions`)을 구현하는 방법을 단계별로 안내합니다.

## 전제 조건

-   `docs/domain/BOILERPLATE_ARCHITECTURE.md` 문서를 먼저 읽고 전체 구조를 이해해야 합니다.

## Step 1: 도메인 브릿지 구현

`boilerplate/AbstractBridge.ts`를 상속받아, 만들려는 도메인에 특화된 `Bridge`를 구현합니다.

```typescript
// src/core/motions/bridge/MotionBridge.ts

import { AbstractBridge, IDisposable } from '@boilerplate/AbstractBridge';
import { RapierRigidBody } from '@react-three/rapier';

// 1. Command, Snapshot, Engine 래퍼 타입 정의
export type MotionCommand = { type: 'jump'; force: number };
export type MotionSnapshot = { position: { x, y, z } };

class RigidBodyWrapper implements IDisposable {
  constructor(public ref: RapierRigidBody) {}
  dispose(): void {} // RapierRigidBody는 별도 dispose 불필요
}

// 2. AbstractBridge를 상속하여 구체 클래스 구현
export class MotionBridge extends AbstractBridge<RigidBodyWrapper, MotionSnapshot, MotionCommand> {
  
  // 3. execute, snapshot 메서드 구현
  execute(id: string, command: MotionCommand): void {
    const engine = this.getEngine(id);
    if (!engine) return;
    // ... 명령에 따른 ref 조작 로직 ...
  }

  snapshot(id: string): Readonly<MotionSnapshot> | null {
    const engine = this.getEngine(id);
    if (!engine) return null;
    // ... ref 상태를 읽어 스냅샷 반환 ...
  }

  // 4. (중요) useFrame에서 호출될 업데이트 함수 추가
  public updateAndNotify(id: string): void {
    // 필요시 여기에 프레임마다 실행될 로직 추가 가능
    this.notifyListeners(id);
  }
}

// 5. 싱글턴 인스턴스 생성
let globalMotionBridge: MotionBridge | null = null;
export function getGlobalMotionBridge(): MotionBridge {
  if (!globalMotionBridge) globalMotionBridge = new MotionBridge();
  return globalMotionBridge;
}
```

## Step 2: 팩토리 훅 생성 (선택 사항, 권장)

매번 `useManagedEntity`에 제네릭 타입을 넘기는 것은 번거롭습니다. 도메인에 특화된 팩토리 훅을 만들면 사용이 간편해집니다.

```typescript
// src/core/motions/hooks/useMotionEntity.ts

import { useManagedEntity } from '@boilerplate/useManagedEntity';
import { getGlobalMotionBridge, RigidBodyWrapper, MotionSnapshot, MotionCommand } from '../bridge/MotionBridge';

export function useMotionEntity(id: string, ref: RefObject<RigidBodyWrapper>) {
  const bridge = getGlobalMotionBridge();
  
  // 제네릭 타입을 미리 지정하여 useManagedEntity 호출
  return useManagedEntity<RigidBodyWrapper, MotionSnapshot, MotionCommand>(
    bridge,
    id,
    ref
  );
}
```

## Step 3: 컴포넌트에서 사용

이제 컴포넌트에서는 도메인 전용 훅(`useMotionEntity`) 하나만 호출하면 모든 준비가 끝납니다.

```tsx
// src/core/motions/components/PhysicsEntity.tsx

import { useMotionEntity } from '../hooks/useMotionEntity';

function PhysicsEntity({ blueprint }) {
  const rigidBodyRef = useRef<RigidBodyWrapper>(null);

  // ✅ 도메인 훅 하나만 호출!
  const managedEntity = useMotionEntity(blueprint.id, rigidBodyRef);

  const handleJump = () => {
    // ✅ 관리 객체를 통해 명령 실행
    managedEntity?.execute({ type: 'jump', force: 300 });
  };

  return (
    <>
      <RigidBody ref={r => (rigidBodyRef.current = r ? new RigidBodyWrapper(r) : null)}>
        {/* ... */}
      </RigidBody>
      <button onClick={handleJump}>Jump</button>
    </>
  );
}
```

## 요약

1.  **Bridge 구현**: `AbstractBridge` 상속
2.  **도메인 훅 생성**: `useManagedEntity` 래핑
3.  **컴포넌트에서 호출**: 도메인 훅 사용

이 과정을 통해 어떤 도메인이든 일관된 방식으로, 최소한의 코드로 구현할 수 있습니다. 