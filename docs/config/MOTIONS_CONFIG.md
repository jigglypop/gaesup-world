# Motions Domain Config Classification

## Store Config (유저 설정값)

초기 설정 또는 유저가 설정 페이지에서 변경하는 값들입니다.

```typescript
type MotionsConfig = {
  walkSpeed: number
  runSpeed: number
  jumpSpeed: number
  jumpGravityScale: number
  normalGravityScale: number
  airDamping: number
  stopDamping: number
  linearDamping: number
  maxSpeed: number
  accelRatio: number
  brakeRatio: number
  gravityScale: number
  angleDelta: THREE.Vector3
  maxAngle: THREE.Vector3
}
```

**언제 변경되는가:**
- 게임 시작 시 초기 설정
- 유저가 Settings 페이지에서 조정
- 캐릭터/차량 스펙 변경 시
- 게임 모드 변경 시

**데이터 플로우:**
```
Settings UI → Store → Bridge → Core Engine (1회성 전달)
```

## Constants (절대 불변값)

코드에서 절대 변하지 않는 물리 상수들입니다.

```typescript
export const PHYSICS_CONSTANTS = {
  MIN_WALK_SPEED: 0.1,
  MAX_WALK_SPEED: 50,
  MIN_JUMP_HEIGHT: 0.5,
  MAX_JUMP_HEIGHT: 20,
  GRAVITY_EARTH: 9.81,
  COLLISION_EPSILON: 0.001,
  RAYCAST_MAX_DISTANCE: 1000,
  GROUND_CHECK_DISTANCE: 0.1,
  VELOCITY_THRESHOLD: 0.01,
  ANGULAR_VELOCITY_LIMIT: 10
} as const
```

**특징:**
- 컴파일 타임에 결정
- 물리 엔진 한계값
- 성능 최적화 임계값

## Realtime State (매 프레임 변화)

Core Layer에서 관리하며 Store에 절대 저장하면 안 되는 값들입니다.

```typescript
type MotionState = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  rotation: THREE.Euler
  angularVelocity: THREE.Vector3
  isGrounded: boolean
  isMoving: boolean
  isFalling: boolean
  speed: number
  direction: THREE.Vector3
  lastGroundHit: number
  collisionInfo: CollisionData[]
}
```

**특징:**
- 매 프레임(60fps) 업데이트
- 물리 엔진에서 직접 계산
- React 상태 관리 절대 금지
- ref 기반으로만 접근

## 잘못된 분류 예시

```typescript
// ❌ 잘못된 분류 - 이런 값들이 Store에 있으면 안됨
type WrongConfig = {
  currentPosition: THREE.Vector3  // 매 프레임 변화 → Realtime State
  isJumping: boolean             // 매 프레임 변화 → Realtime State
  velocityMagnitude: number      // 매 프레임 계산 → Realtime State
  PHYSICS_TIMESTEP: number       // 절대 불변 → Constants
}
```

## 올바른 구현 패턴

### Config 변경 시 (1회성)
```typescript
// Settings에서 walkSpeed 변경
const updateWalkSpeed = (newSpeed: number) => {
  motionStore.setConfig({ walkSpeed: newSpeed })
}

// Hook에서 감지하여 Core로 전달
useEffect(() => {
  physicsEngine.updateConfig(motionStore.config)
}, [motionStore.config.walkSpeed])

// Core에서 적용
class PhysicsEngine {
  updateConfig(config: MotionsConfig) {
    this.walkSpeed = config.walkSpeed
  }
}
```

### 실시간 계산 (매 프레임)
```typescript
// Core Layer - Store 접근 없이 기존 설정값 사용
class PhysicsEngine {
  update(deltaTime: number) {
    const movement = this.inputDirection.multiplyScalar(
      this.walkSpeed * deltaTime
    )
    this.rigidBody.setLinvel(movement, true)
    
    this.updateState({
      position: this.rigidBody.translation(),
      velocity: this.rigidBody.linvel(),
      isGrounded: this.checkGrounded()
    })
  }
}
```

이 분류를 통해 성능과 아키텍처 무결성을 보장합니다. 