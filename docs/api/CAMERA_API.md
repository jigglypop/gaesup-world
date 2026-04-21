# 카메라 API

## 개요

이 문서는 현재 코드 기준으로 외부에서 자주 접근하는 카메라 도메인 API를 정리합니다.

관련 경로:

- `src/core/camera/index.ts`
- `src/core/camera/core/CameraSystem.ts`
- `src/core/camera/hooks/useCamera.ts`
- `src/core/camera/controllers/*`
- `src/core/camera/components/*`

## 주요 export

현재 카메라 도메인은 아래 성격의 API를 내보냅니다.

- 시스템: `CameraSystem`
- 훅: `useCamera`
- 컴포넌트: `Camera`
- 타입: `CameraOptionType`, `CameraType`, `CameraSystemConfig` 등
- 컨트롤러 클래스: `ThirdPersonController`, `FirstPersonController`, `ChaseController` 등
- 디버그/프리셋 UI
- 브리지 관련 API

## 시스템 API

### `CameraSystem`

카메라 계산의 중심 시스템입니다.

생성:

```ts
const system = new CameraSystem(config);
```

주요 메서드:

- `registerController(controller)`
- `updateConfig(config)`
- `update(deltaTime)`
- `calculate(props)`
- `getCameraState(name)`
- `getCurrentCameraState()`
- `addCameraState(name, state)`
- `setCameraTransitions(transitions)`
- `switchCameraState(name)`

용도:

- 카메라 모드별 계산 실행
- 상태 전환 관리
- 카메라 설정 반영

## 훅 API

### `useCamera()`

React 쪽에서 카메라 시스템을 실제로 연결하는 훅입니다.

반환:

- `system`

실제 내부 동작:

- `useThree()`와 연결
- `useStateSystem()`으로 플레이어 상태 조회
- `useCameraBridge()`로 시스템 연결
- `useFrame()`에서 `system.calculate()` 실행
- 마우스 휠 줌 처리
- 포커스 해제 키 처리

일반적으로는 이 훅을 직접 쓰기보다 `Camera` 컴포넌트를 통해 사용합니다.

## 컴포넌트 API

### `Camera`

카메라 훅과 시스템을 실제 장면에 적용하는 기본 컴포넌트입니다.

보통 외부에서는 직접 props를 많이 넘기기보다 월드 루트 안에서 그대로 배치됩니다.

### `CameraController`

카메라 관련 조작 UI입니다.

### `CameraPresets`

카메라 프리셋 선택 UI입니다.

### `CameraDebugPanel`

현재 카메라 상태와 옵션을 확인하는 디버그 UI입니다.

## 컨트롤러 API

현재 등록되는 컨트롤러:

- `ThirdPersonController`
- `FirstPersonController`
- `ChaseController`
- `TopDownController`
- `IsometricController`
- `SideScrollController`
- `FixedController`

이 클래스들은 보통 직접 생성해서 쓸 일보다 `CameraSystem` 내부 등록 대상으로 이해하는 편이 자연스럽습니다.

## 타입 API

### `CameraOptionType`

외부에서 가장 자주 만지는 옵션 타입입니다.

대표 필드:

- `xDistance`
- `yDistance`
- `zDistance`
- `fov`
- `zoom`
- `enableZoom`
- `enableCollision`
- `focus`
- `focusTarget`
- `smoothing`
- `bounds`

### `CameraType`

지원 카메라 모드 문자열 타입입니다.

```ts
type CameraType =
  | 'thirdPerson'
  | 'firstPerson'
  | 'topDown'
  | 'sideScroll'
  | 'isometric'
  | 'fixed'
  | 'chase';
```

### `CameraSystemConfig`

시스템 내부 계산에 쓰이는 설정 타입입니다.

대표 필드:

- `mode`
- `distance`
- `smoothing`
- `fov`
- `zoom`
- `enableCollision`

## 사용 예시

### 월드 설정으로 카메라 옵션 전달

```tsx
import { GaesupWorld } from 'gaesup-world';

<GaesupWorld
  mode={{ type: 'character', control: 'thirdPerson' }}
  cameraOption={{
    xDistance: -7,
    yDistance: 10,
    zDistance: -13,
    fov: 75,
    enableCollision: true,
  }}
>
  {/* contents */}
</GaesupWorld>
```

### 훅 직접 사용

```tsx
import { useCamera } from 'gaesup-world';

function CameraBootstrap() {
  useCamera();
  return null;
}
```

## 함께 보면 좋은 문서

- [카메라 도메인 문서](../domain/CAMERA.md)
- [카메라 설정 문서](../config/CAMERA_CONFIG.md)
