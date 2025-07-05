# Motions Domain Architecture

## 개요

Motions 도메인은 캐릭터, 차량, 비행기 등의 물리적 움직임과 상호작용을 담당합니다. Blueprint 데이터를 소비하여 실제 물리 엔진과 연동합니다.

## 폴더 구조

```
src/core/motions/
├── components/              # Layer 3: React 컴포넌트
│   ├── entities/           # 엔티티 렌더링
│   │   ├── PhysicsEntity/
│   │   │   ├── index.tsx
│   │   │   ├── styles.css
│   │   │   └── types.ts
│   │   ├── InnerGroup/
│   │   └── PartsGroup/
│   ├── controllers/        # UI 컨트롤러
│   │   ├── EntityController/
│   │   └── MotionController/
│   ├── ui/                 # 일반 UI
│   │   ├── MotionUI/
│   │   └── Teleport/
│   └── debug/              # 디버그 도구
│       └── MotionDebugPanel/
│
├── controllers/             # Layer 2: 비즈니스 로직 (Non-React)
│   ├── AnimationController.ts
│   ├── MotionController.ts
│   └── PhysicsController.ts
│
├── hooks/                   # Layer 2: React Hooks
│   ├── core/               # 단일 책임 훅
│   │   ├── usePhysicsLoop.ts      # ~50줄, useFrame 기반 물리 루프
│   │   ├── useMotionBridge.ts     # ~60줄, 브릿지 등록/해제
│   │   ├── useCollisionHandlers.ts # ~40줄, 충돌 핸들링
│   │   └── useTeleportListener.ts # ~30줄, 텔레포트 이벤트
│   ├── composed/           # 조합된 훅
│   │   └── usePhysicsEntity.ts    # ~80줄, 위 훅들을 조합
│   └── index.ts
│
├── stores/                  # Layer 2: Zustand 상태 관리
│   ├── motionSlice.ts      # 모션 상태 슬라이스
│   │   ├── position, velocity, rotation 스냅샷
│   │   ├── physics 상태
│   │   └── animation 상태
│   └── types.ts
│
├── core/                    # Layer 1: 순수 로직, ref 기반
│   ├── engine/             # 물리/모션 엔진
│   │   ├── MotionEngine.ts
│   │   ├── PhysicsEngine.ts
│   │   └── StateEngine.ts
│   ├── forces/             # 물리력 계산
│   │   ├── ForceComponent.ts
│   │   ├── JumpForce.ts
│   │   └── GravityForce.ts
│   ├── movement/           # 이동 로직
│   │   ├── CharacterMovement.ts
│   │   └── VehicleMovement.ts
│   ├── refs/               # ref 기반 유틸리티
│   │   ├── PhysicsRef.ts
│   │   └── AnimationRef.ts
│   └── types.ts
│
├── bridge/                  # 레이어 간 통신
│   ├── MotionBridge.ts
│   └── types.ts
│
├── types/                   # 도메인 공통 타입
│   ├── physics.ts
│   ├── animation.ts
│   └── index.ts
└── index.ts                # 공개 API
```

## 핵심 개념

### 1. PhysicsEntity
- Layer 3 컴포넌트로, 물리 엔티티를 렌더링
- RigidBody와 Collider를 포함
- Blueprint 데이터를 기반으로 초기화

### 2. MotionBridge
- Layer 1(ref)과 Layer 2(state) 사이의 유일한 통신 채널
- ref 등록/해제, 명령 실행, 스냅샷 제공
- React/Zustand 의존성 없음

### 3. usePhysicsEntity (조합 훅)
- 여러 core 훅들을 조합한 메인 훅
- Blueprint를 받아 물리 엔티티 생성
- Bridge를 통해 상태 동기화

## Blueprint 소비 패턴

```typescript
// hooks/composed/usePhysicsEntity.ts
import { WARRIOR_BLUEPRINT } from '@blueprints/characters/warrior';

export function usePhysicsEntity(blueprintId: string) {
  const blueprint = getBlueprint(blueprintId);
  const engineRef = useRef<PhysicsEngine>();
  
  // Blueprint의 physics 데이터 사용
  const physics = {
    mass: blueprint.physics.mass,
    jumpForce: blueprint.physics.jumpForce,
    moveSpeed: blueprint.physics.moveSpeed
  };
  
  // 각 core 훅 사용
  const bridge = useMotionBridge(id, rigidBodyRef);
  const { handleCollision } = useCollisionHandlers(callbacks);
  
  usePhysicsLoop(engineRef, physics);
  useTeleportListener(rigidBodyRef);
  
  return { bridge, handleCollision };
}
```

## 마이그레이션 계획

### Phase 1: 구조 생성
1. 새 폴더 구조 생성 (components/, stores/, hooks/core/ 등)
2. tsconfig paths 설정
3. ESLint 규칙 추가

### Phase 2: 코드 이동
1. **usePhysics.ts 분해** (최우선)
   - usePhysicsLoop.ts
   - useMotionBridge.ts
   - useCollisionHandlers.ts
   - useTeleportListener.ts
   
2. **컴포넌트 이동**
   - entities/refs/* → components/entities/*
   - ui/* → components/ui/*
   
3. **순수 로직 분리**
   - ref 유틸리티 → core/refs/
   - 엔진 로직 → core/engine/

### Phase 3: 상태 관리
1. motionSlice 구현
2. Bridge를 통한 스냅샷 동기화
3. 기존 gaesupStore 의존성 제거

## 주의사항

1. **레이어 규칙 준수**
   - Layer 1에서 React/Zustand 사용 금지
   - useFrame 내에서 setState 금지
   - Bridge를 통해서만 레이어 간 통신

2. **파일 크기 제한**
   - Core hooks: 최대 80줄
   - Components: 최대 200줄
   - Engine: 최대 500줄

3. **성능 최적화**
   - 스냅샷은 읽기 전용 (Object.freeze)
   - 선택적 구독으로 리렌더링 최소화
   - ref 기반 로직으로 60fps 유지 