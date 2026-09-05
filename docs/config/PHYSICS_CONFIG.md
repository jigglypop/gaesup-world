# Physics 설정

이 문서는 현재 코드 기준의 물리 설정을 정리합니다.

## Store 위치

물리 설정은 `src/core/stores/slices/physics`에 있습니다.

```ts
type PhysicsConfigType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  gravityScale?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
  jumpGravityScale?: number;
  normalGravityScale?: number;
  airDamping?: number;
  stopDamping?: number;
};
```

## 기본값

현재 slice의 기본값:

```ts
const initialState = {
  walkSpeed: 10,
  runSpeed: 20,
  jumpSpeed: 15,
  jumpGravityScale: 1.5,
  normalGravityScale: 1.0,
  airDamping: 0.1,
  stopDamping: 2.0,
  maxSpeed: 10,
  accelRatio: 2,
  brakeRatio: 5,
  gravityScale: 0.3,
  angleDelta: new Vector3(0.02, 0.02, 0.02),
  maxAngle: new Vector3(Math.PI / 6, Math.PI, Math.PI / 6),
  linearDamping: 0.9,
};
```

## 사용

```tsx
import { useGaesupStore } from 'gaesup-world';

const walkSpeed = useGaesupStore((state) => state.physics.walkSpeed);
const setPhysics = useGaesupStore((state) => state.setPhysics);

setPhysics({ walkSpeed: 12 });
```

## 현재 없는 설정

아래 항목은 현재 구현된 public config API가 아닙니다.

- `PhysicsWorldSettings`
- solver iteration 설정
- `CharacterMovementSettings`
- Unreal-style vehicle wheel/suspension 설정
- flight physics full config
- physics quality level
- multithreading toggle
- head bob, motion sickness preference

필요하면 `PhysicsConfigType`과 실제 motion/physics system 적용 경로를 함께 확장해야 합니다.
