# Gaesup Hook 가이드

## 1. Hook의 역할과 원칙

Hook은 **Layer 2 (State Management Layer)** 의 핵심 요소로, **재사용 가능한 비즈니스 로직과 상태 관리**를 캡슐화합니다. Gaesup 프로젝트의 Hook은 다음 두 가지 원칙을 따릅니다.

1.  **책임 분리**: 로직의 복잡성에 따라 명확하게 역할을 분리합니다.
2.  **단순한 API 제공**: 최종 사용자는 복잡한 내부 구조를 몰라도, 가장 단순한 인터페이스(팩토리 훅)를 통해 기능을 사용할 수 있어야 합니다.

## 2. Hook 구조: Base Hooks + Factory Hook

프로젝트의 모든 훅은 `boilerplate`에 정의된 **Base Hook**과, 이를 조합하여 최종 기능을 제공하는 **Factory Hook**으로 구성됩니다.

### **Base Hooks (기반 훅)**

-   **위치**: `src/core/boilerplate/`
-   **역할**: `useEffect`, `useFrame`과 같이 React의 핵심 API를 직접 감싸, 특정 단일 책임을 수행하는 재사용 가능한 최소 단위의 훅입니다.
-   **종류**:
    -   `useBaseLifecycle.ts`: 컴포넌트의 생명주기(`mount`, `unmount`)에 맞춰 특정 로직(e.g., Bridge 등록/해제)을 실행합니다. `useEffect`를 사용합니다.
    -   `useBaseFrame.ts`: 매 프레임마다 특정 로직(e.g., Bridge에 스냅샷 업데이트 알림)을 실행합니다. `useFrame`을 사용합니다.

### **Factory Hook (팩토리 훅)**

-   **위치**: 각 도메인의 `hooks/` 폴더 (e.g., `motions/hooks/`) 또는 `boilerplate/`
-   **역할**: 여러 `Base Hook`과 `ManagedEntity` 클래스 등을 조합하여, **엔티티 관리에 필요한 모든 것을 한번에 생성하고 연결하는 공장** 역할을 합니다. 컴포넌트 개발자가 최종적으로 사용하게 될 메인 훅입니다.
-   **예시**: `useManagedEntity.ts`

#### **`useManagedEntity` 팩토리 훅 예시**

이 훅은 `Base Hook`들을 내부적으로 호출하여, 개발자가 직접 `useEffect`나 `useFrame`을 다룰 필요가 없게 만들어줍니다.

```typescript
// boilerplate/useManagedEntity.ts
import { useMemo, RefObject } from 'react';
import { ManagedEntity } from './ManagedEntity';
import { useBaseLifecycle } from './useBaseLifecycle';
import { useBaseFrame } from './useBaseFrame';

export function useManagedEntity(...) {
  // 1. ManagedEntity 인스턴스 생성
  const managedEntity = useMemo(() => {
    // ...
  }, [bridge, id, ref.current]);

  // 2. Base Hook들을 내부에서 호출하여 생명주기와 프레임 로직 연결
  useBaseLifecycle(bridge, id, managedEntity?.engine || null);
  useBaseFrame(bridge, id);

  // 3. 관리 객체 반환
  return managedEntity;
}
```

## 3. 최종 사용법: 컴포넌트의 극단적인 단순화

`Factory Hook` 덕분에, 최종 컴포넌트는 매우 단순해집니다.

```tsx
// motions/components/PhysicsEntity.tsx
import { useManagedEntity } from '@boilerplate/useManagedEntity';
import { getGlobalMotionBridge } from '../bridge/MotionBridge';

function PhysicsEntity({ blueprint }) {
  const rigidBodyRef = useRef<RigidBodyWrapper>(null);
  const bridge = getGlobalMotionBridge();

  // ✅ 팩토리 훅 하나만 호출하면 모든 설정이 끝납니다.
  const managedEntity = useManagedEntity(bridge, blueprint.id, rigidBodyRef);

  // 이제 렌더링에만 집중할 수 있습니다.
  return <RigidBody ref={rigidBodyRef.current?.ref} {...blueprint.physics} />;
}
```

이 패턴을 통해 보일러플레이트를 최소화하고, 각 모듈의 역할을 명확하게 유지할 수 있습니다. 