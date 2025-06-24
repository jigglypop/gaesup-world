# Gaesup 타입 가이드

이 문서는 Gaesup 프로젝트에서 사용되는 핵심 타입들을 설명하여, 코드의 일관성과 안정성을 높이는 것을 목표로 합니다.

## 1. 전역 상태 타입 (`src/core/stores/types.ts`)

### `StoreState`
Zustand 스토어의 전체 상태를 나타내는 통합 타입입니다. 각 기능별 `Slice`들을 조합하여 만들어집니다.

```typescript
export type StoreState = UrlsSlice &
  ModeSlice &
  BlockSlice &
  // ...
  AnimationSlice &
  MotionSliceState &
  // ...
  {
    updateState: (updates: Partial<StoreState>) => void;
    initialize: (config: Partial<StoreState>) => void;
  };
```

### `ModeType`
플레이어의 현재 조작 모드를 정의합니다. 캐릭터, 차량, 비행기 등 다양한 모드를 가질 수 있습니다.

```typescript
export type ModeType = 'character' | 'vehicle' | 'airplane';
```

### `ControllerType`
사용자의 입력 방식을 정의합니다. 클릭, 키보드, 조이스틱 등 다양한 입력 방식을 지원할 수 있습니다.

```typescript
export type ControllerType = 'clicker' | 'keyboard' | 'joystick' | 'gamepad';
```

### `CameraType`
카메라의 시점을 정의합니다. 3인칭, 1인칭, 고정 시점 등 다양한 카메라 모드를 지원합니다.

```typescript
export type CameraType =
  | 'thirdPerson'
  | 'shoulder'
  | 'fixed'
  | 'firstPerson'
  // ...
```

---

## 2. 애니메이션 타입 (`src/core/animation/core/types.ts`)

### `AnimationType`
애니메이션이 적용될 엔티티의 타입을 정의합니다. `ModeType`과 유사하지만, 로봇과 같이 조작 불가능한 엔티티도 포함될 수 있습니다.

```typescript
export type AnimationType = 'character' | 'vehicle' | 'airplane' | 'robot';
```

### `AnimationState`
특정 `AnimationType`에 대한 현재 애니메이션 상태를 저장합니다.

- `current`: 현재 재생 중인 애니메이션 이름 (e.g., 'walk', 'run')
- `default`: 기본 상태 애니메이션 (e.g., 'idle')
- `store`: 해당 엔티티가 가진 모든 `THREE.AnimationAction`의 맵

```typescript
export interface AnimationState {
  current: string;
  default: string;
  store: Record<string, THREE.AnimationAction>;
}
```

### `EntityAnimationStates`
모든 `AnimationType`에 대한 `AnimationState`를 포함하는 객체입니다.

```typescript
export interface EntityAnimationStates {
  character: AnimationState;
  vehicle: AnimationState;
  airplane: AnimationState;
}
```

### `AnimationCommand`
`AnimationBridge`를 통해 애니메이션 엔진에 전달되는 명령의 구조를 정의합니다.

```typescript
export interface AnimationCommand {
  type: 'play' | 'stop' | 'pause' | 'setWeight' | 'setSpeed' | 'blend';
  animation?: string;
  // ...
}
```

### `AnimationSnapshot`
특정 시점의 애니메이션 엔진 상태를 나타내는 읽기 전용 데이터입니다. 디버그 패널 등에서 사용됩니다.

```typescript
export interface AnimationSnapshot {
  currentAnimation: string;
  isPlaying: boolean;
  availableAnimations: string[];
  // ...
}
```

---

## 3. 모션(물리) 타입 (`src/core/motions/types.ts`)

### `PhysicsState`
물리 계산에 필요한 모든 상태를 포함하는 핵심 타입입니다. `useFrame` 루프 내에서 사용되며, 직접적인 상태 변경을 피하기 위해 `ref`로 관리됩니다.

- `activeState`: 현재 조작 중인 캐릭터의 위치, 속도 등
- `gameStates`: 점프, 착지 등 게임의 주요 상태 플래그
- `keyboard`, `mouse`: 사용자 입력 상태
- `characterConfig`, `vehicleConfig`, `airplaneConfig`: 각 모드별 물리 설정값

```typescript
export interface PhysicsState {
  activeState: ActiveStateType;
  gameStates: GameStatesType;
  keyboard: { ... };
  mouse: { ... };
  characterConfig: characterType;
  // ...
}
```

### `characterConfigType` / `vehicleConfigType` / `airplaneConfigType`
각 모드별 상세 물리 속성을 정의합니다. 점프 속도, 가속도, 선회 속도 등을 설정할 수 있습니다.

```typescript
export type characterConfigType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  // ...
};
```

---

## 타입 네이밍 컨벤션

- **`*Type`**: 단순 `type` alias 또는 여러 타입을 `|`로 조합한 경우 (e.g., `ModeType`)
- **`*State` / `*States`**: 상태를 나타내는 객체 (e.g., `AnimationState`)
- **`*Slice`**: Zustand 스토어의 일부를 나타내는 `interface` (e.g., `AnimationSlice`)
- **`*Config`**: 설정값을 나타내는 객체 (e.g., `characterConfigType`)
- **`*Props`**: React 컴포넌트의 `props` (e.g., `AnimationPlayerProps`)
- **`*Command` / `*Snapshot`**: 특정 목적을 가진 읽기 전용 데이터 객체

</rewritten_file> 