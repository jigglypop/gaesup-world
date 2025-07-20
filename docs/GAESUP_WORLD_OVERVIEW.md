# Gaesup World - Complete Project Overview

## 프로젝트 소개

Gaesup World는 **React Three Fiber 기반의 3D 게임 엔진 프레임워크**입니다. 고성능 물리 시뮬레이션, 실시간 캐릭터 제어, 건축 시스템을 제공하며, Blueprint 기반의 데이터 중심 엔티티 관리 시스템을 특징으로 합니다.

## 핵심 아키텍처

### 3-Layer Architecture
```
Layer 3 (UI/Components)     → React 컴포넌트, 사용자 인터페이스
Layer 2 (State/Hooks)       → Zustand Store, React Hooks, Bridge Pattern  
Layer 1 (Core/Engine)       → Three.js, Rapier Physics, 순수 로직
```

### Bridge Pattern
- **단방향 데이터 흐름**: Layer 2 → Layer 1 (명령), Layer 1 → Layer 2 (스냅샷)
- **실시간 동기화**: `useFrame`을 통한 60FPS 상태 업데이트
- **도메인 독립성**: 각 도메인이 독립적인 Bridge 시스템 보유

## 도메인 구조

### 1. **Boilerplate Domain** (`src/core/boilerplate/`)
- **역할**: 모든 도메인의 기반이 되는 재사용 가능한 아키텍처 패턴
- **핵심 구성요소**:
  - `AbstractBridge`: 모든 브릿지의 기반 클래스
  - `ManagedEntity`: 엔티티 생명주기 관리
  - `useManagedEntity`: 팩토리 훅 패턴
  - DI Container, 데코레이터 시스템

### 2. **Animation Domain** (`src/core/animation/`)
- **역할**: 3D 모델 애니메이션 재생 및 상태 전환 관리
- **브릿지**: `AnimationBridge`
- **주요 컴포넌트**: `AnimationController`, `AnimationPlayer`, `AnimationDebugPanel`

### 3. **Camera Domain** (`src/core/camera/`)
- **역할**: 다양한 카메라 모드와 컨트롤러 제공
- **컨트롤러**: ThirdPerson, FirstPerson, Chase, TopDown, Isometric, SideScroll, Fixed
- **브릿지**: `CameraBridge`

### 4. **Motions Domain** (`src/core/motions/`)
- **역할**: 물리 시뮬레이션, 캐릭터 이동, 차량 제어
- **브릿지**: `MotionBridge`, `PhysicsBridge`
- **핵심 시스템**: `MotionSystem`, `PhysicsSystem`, `EntityStateManager`

### 5. **Interactions Domain** (`src/core/interactions/`)
- **역할**: 키보드, 마우스, 게임패드 입력 처리 및 자동화
- **브릿지**: `InteractionBridge`
- **시스템**: `InteractionSystem`, `AutomationSystem`

### 6. **World Domain** (`src/core/world/`)
- **역할**: 게임 월드, 환경, 객체 관리
- **브릿지**: `WorldBridge`
- **컴포넌트**: `WorldContainer`, `Rideable`, `Teleport`

### 7. **Building Domain** (`src/core/building/`)
- **역할**: 실시간 건축 도구 및 그리드 시스템
- **시스템**: `BuildingSystem`, `TileSystem`, `WallSystem`
- **컴포넌트**: `BuildingController`, `BuildingUI`, `GridHelper`

### 8. **Blueprints Domain** (`src/blueprints/`)
- **역할**: 모든 게임 엔티티의 데이터 중심 정의 시스템
- **구성요소**: `BlueprintRegistry`, `BlueprintFactory`, `BlueprintConverter`
- **지원 타입**: Character, Vehicle, Airplane, Animation, Behavior, Item

### 9. **Editor Domain** (`src/core/editor/`)
- **역할**: 개발자 도구 및 에디터 인터페이스
- **컴포넌트**: `EditorLayout`, `ResizablePanel`, 각종 디버그 패널

### 10. **Admin Domain** (`src/admin/`)
- **역할**: 관리자 인터페이스 및 인증 시스템
- **기능**: 로그인, 사용자 관리, 시스템 모니터링

### 11. **Examples** (`examples/`)
- **역할**: 실제 사용 예제 및 데모
- **페이지**: World, BuildingEditor, BlueprintEditor

## 주요 특징

### 1. **Blueprint 시스템**
```typescript
export const WARRIOR_BLUEPRINT: CharacterBlueprint = {
  id: 'char_warrior_basic',
  physics: { mass: 80, jumpForce: 350 },
  animations: { idle: 'warrior_idle.glb' },
  stats: { health: 100, strength: 15 }
};
```

### 2. **Bridge 패턴**
```typescript
// 명령 전송 (Layer 2 → Layer 1)
bridge.execute(id, { type: 'move', data: direction });

// 상태 스냅샷 (Layer 1 → Layer 2)
const snapshot = bridge.snapshot(id);
```

### 3. **Factory Hook 패턴**
```typescript
const entity = useManagedEntity(bridge, id, ref, options);
// 자동으로 생명주기, 프레임 루프 연결
```

### 4. **상태 관리 (Zustand Slices)**
- 도메인별 독립적인 상태 슬라이스
- Immer를 통한 불변성 보장
- 선택적 구독 패턴

## 성능 최적화

1. **프레임 루프 분리**: React 렌더링과 물리 계산 독립
2. **스냅샷 캐싱**: 불필요한 계산 방지
3. **선택적 업데이트**: 변경된 부분만 업데이트
4. **데코레이터 기반 모니터링**: 성능 프로파일링

## 확장성

1. **도메인 독립성**: 새로운 도메인 추가 용이
2. **Blueprint 확장**: 새로운 엔티티 타입 정의 가능
3. **Bridge 확장**: 커스텀 브릿지 구현 지원
4. **컴포넌트 시스템**: 플러그인 방식 확장

## 문서 구조

각 도메인별 상세 문서:
- [Boilerplate Domain](./BOILERPLATE_DOMAIN.md)
- [Animation Domain](./ANIMATION_DOMAIN.md)
- [Camera Domain](./CAMERA_DOMAIN.md)
- [Motions Domain](./MOTIONS_DOMAIN.md)
- [Interactions Domain](./INTERACTIONS_DOMAIN.md)
- [World Domain](./WORLD_DOMAIN.md)
- [Building Domain](./BUILDING_DOMAIN.md)
- [Blueprints Domain](./BLUEPRINTS_DOMAIN.md)
- [Editor Domain](./EDITOR_DOMAIN.md)
- [Admin Domain](./ADMIN_DOMAIN.md)
- [Examples Guide](./EXAMPLES_GUIDE.md) 