# 모션 도메인

## 개요

모션 도메인은 엔티티의 이동, 물리 상태, 이동 관련 브리지, 엔티티 래퍼를 담당합니다. 캐릭터, 차량, 비행기처럼 “움직이는 대상”의 상태를 공통 흐름으로 묶는 역할을 합니다.

현재 기준 핵심 축은 아래와 같습니다.

- 시스템: `MotionSystem`, `PhysicsSystem`
- 브리지: `MotionBridge`, `PhysicsBridge`
- 훅: `useMotion`, `usePhysics`, `usePhysicsBridge`, `usePlayerPosition`, `useStateSystem`
- 엔티티 계층: `ManagedMotionEntity`, `PhysicsEntity`, `RiderRef` 등
- 컨트롤러/UI: `EntityController`, `MotionController`, `MotionUI`, `MotionDebugPanel`, `Teleport`

## 관련 경로

- `src/core/motions/core/`
- `src/core/motions/bridge/`
- `src/core/motions/hooks/`
- `src/core/motions/entities/`
- `src/core/motions/controller/`
- `src/core/motions/ui/`

## 주요 구성 요소

### `MotionSystem`

이동 상태를 계산하는 핵심 시스템입니다.

주요 역할:

- 현재 위치, 속도, 회전 추적
- 지면 접촉 여부 관리
- 이동 중 여부 판단
- 속도/거리 메트릭 계산
- 점프 힘 계산
- 이동 힘 적용

즉, 엔티티가 어떻게 움직이고 있는지에 대한 상태와 계산은 이 시스템이 담당합니다.

### `PhysicsSystem`

물리 쪽 세부 상태와 상호작용을 담당하는 시스템입니다. `motions` 도메인 안에서 실제 Rapier 연동과 더 가까운 축에 있습니다.

### `MotionBridge`

모션 도메인의 명령/스냅샷 브리지입니다.

도메인 이름:

- `motion`

주요 기능:

- 엔티티 등록
- `move`, `jump`, `stop`, `reset`, `setConfig` 명령 실행
- `RapierRigidBody` 상태를 읽어서 snapshot 생성
- 엔티티별 캐시 snapshot 유지

현재 snapshot에는 아래 정보가 포함됩니다.

- 타입
- 위치
- 속도
- 회전
- 지면 접촉 여부
- 이동 여부
- 속도
- 메트릭
- 설정값

### `PhysicsBridge`

물리 관련 상태와 명령을 연결하는 별도 브리지입니다. `MotionBridge`와 함께 사용되며, 모션/물리의 관심사를 나누는 역할을 합니다.

### 엔티티 계층

`src/core/motions/entities/` 아래에는 실제 움직이는 엔티티를 구성하는 래퍼와 ref 계층이 들어 있습니다.

대표 항목:

- `ManagedMotionEntity`
- `PhysicsEntity`
- `InnerGroupRef`
- `PartsGroupRef`
- `RiderRef`

이 계층은 Three.js 그룹, Rapier 바디, 애니메이션 상태를 연결하는 실전용 구조에 가깝습니다.

### 훅 계층

대표 훅:

- `useMotion`
- `usePhysics`
- `usePhysicsBridge`
- `usePlayerPosition`
- `useStateSystem`
- `useBlueprintEntity`
- `useInteractionSystem`
- `useGaesupGltf`

이 중 자주 보는 훅은:

- `usePlayerPosition`: 현재 플레이어 위치를 읽는 용도
- `useStateSystem`: 현재 active state를 참조하는 용도
- `usePhysicsBridge`: 브리지 연결

### 컨트롤러/UI

대표 구성:

- `EntityController.tsx`
- `MotionController`
- `MotionUI`
- `MotionDebugPanel`
- `Teleport`

즉, 이동 도메인은 시스템만 있는 게 아니라 실제 조작 UI와 디버그 UI까지 포함합니다.

## 동작 흐름

모션 도메인의 일반적인 흐름은 아래와 같습니다.

1. 움직이는 엔티티가 `RapierRigidBody`와 함께 생성됩니다.
2. 모션/물리 브리지에 엔티티가 등록됩니다.
3. 이동 입력이나 게임 로직이 `move`, `jump`, `stop` 명령을 보냅니다.
4. `MotionSystem`이 힘 적용, 속도 계산, 상태 업데이트를 수행합니다.
5. 브리지가 현재 rigid body 상태를 snapshot으로 만듭니다.
6. 훅과 UI가 이 snapshot 또는 store 상태를 사용합니다.

## 현재 강점

- 모션과 물리 흐름이 브리지 기반으로 분리되어 있습니다.
- snapshot 구조가 있어 UI와 디버그 연결이 쉽습니다.
- 엔티티 ref 계층이 분리되어 있어 실제 월드 오브젝트와 잘 결합됩니다.
- 캐릭터/차량/비행기 흐름을 공통 계층으로 다룰 수 있습니다.

## 현재 한계

- 도메인 규모가 커서 처음 진입 시 파악 비용이 높습니다.
- 모션, 물리, 상호작용, 애니메이션 경계가 일부 파일에서는 촘촘히 얽혀 있습니다.
- `motionsRuntime`을 통한 bridge/input 주입 경로가 생겼지만, 일부 fallback 경로는 여전히 `BridgeFactory` singleton과 DOM teleport event를 지원합니다.

## 사용 예시

```tsx
import { usePlayerPosition } from 'gaesup-world';

export function PlayerPositionText() {
  const position = usePlayerPosition();

  return <div>{position.join(', ')}</div>;
}
```

## 함께 보면 좋은 파일

- `src/core/motions/bridge/MotionBridge.ts`
- `src/core/motions/bridge/PhysicsBridge.ts`
- `src/core/motions/core/system/MotionSystem.ts`
- `src/core/motions/core/system/PhysicsSystem.ts`
- `src/core/motions/hooks/useStateSystem.ts`
- `src/core/motions/hooks/usePlayerPosition.ts`
- `src/core/motions/entities/ManagedMotionEntity.ts`
- `src/core/motions/controller/EntityController.tsx`
