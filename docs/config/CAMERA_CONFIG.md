# 카메라 설정 문서

## 개요

이 문서는 현재 코드 기준으로 카메라 설정이 어디에서 들어오고, 어떤 필드들이 실제로 사용되는지 정리한 문서입니다.

관련 구현 위치:

- `src/core/camera/core/types.ts`
- `src/core/camera/bridge/types.ts`
- `src/core/camera/hooks/useCamera.ts`

## 설정이 들어가는 주요 경로

카메라 설정은 크게 두 층에서 다뤄집니다.

### 1. 외부 사용자가 다루는 옵션

외부에서는 보통 `cameraOption` 형태를 다룹니다.

관련 타입:

- `CameraOption`
- `CameraOptionType`

이 타입은 `GaesupWorld` 또는 store를 통해 입력되는 고수준 설정에 가깝습니다.

### 2. 시스템 내부 설정

실제 `CameraSystem`이 계산에 사용하는 값은 `CameraSystemConfig`입니다.

관련 타입:

- `src/core/camera/core/types.ts`의 `CameraSystemConfig`
- `src/core/camera/bridge/types.ts`의 `CameraSystemConfig`

`useCamera()`가 외부 옵션을 읽어서 시스템용 설정으로 변환합니다.

## `CameraOption` 필드

현재 코드에 정의된 주요 필드는 아래와 같습니다.

### 위치/거리 관련

- `offset?: THREE.Vector3`
- `maxDistance?: number`
- `distance?: number`
- `xDistance?: number`
- `yDistance?: number`
- `zDistance?: number`
- `target?: THREE.Vector3`
- `position?: THREE.Vector3`
- `fixedPosition?: THREE.Vector3`
- `rotation?: THREE.Euler`

### 줌 관련

- `zoom?: number`
- `enableZoom?: boolean`
- `zoomSpeed?: number`
- `minZoom?: number`
- `maxZoom?: number`

### 포커스 관련

- `focus?: boolean`
- `focusTarget?: THREE.Vector3`
- `focusDuration?: number`
- `focusDistance?: number`
- `focusLerpSpeed?: number`
- `enableFocus?: boolean`

### 충돌 및 보간 관련

- `enableCollision?: boolean`
- `collisionMargin?: number`
- `smoothing?: { position?: number; rotation?: number; fov?: number }`

### 시야각 관련

- `fov?: number`
- `minFov?: number`
- `maxFov?: number`

### 모드/특수 설정

- `bounds?: CameraBounds`
- `mode?: string`
- `isoAngle?: number`
- `modeSettings?: { character?: ...; vehicle?: ...; airplane?: ... }`

## `CameraSystemConfig` 필드

실제 시스템 내부 계산에 들어가는 설정입니다.

코어 타입 기준 주요 필드:

- `mode: string`
- `distance: { x: number; y: number; z: number }`
- `bounds?: CameraBounds`
- `enableCollision: boolean`
- `orbitYaw?: number`
- `orbitPitch?: number`
- `smoothing?: { position: number; rotation: number; fov: number }`
- `fov?: number`
- `zoom?: number`
- `xDistance?: number`
- `yDistance?: number`
- `zDistance?: number`
- `fixedPosition?: THREE.Vector3`
- `fixedLookAt?: THREE.Vector3`

브리지 타입 쪽에는 아래 필드도 존재합니다.

- `minDistance?: number`
- `maxDistance?: number`
- `offset?: { x: number; y: number; z: number }`
- `lookAt?: { x: number; y: number; z: number }`
- `damping?: number`
- `enableDamping?: boolean`

## 현재 기본 흐름

`useCamera()`는 아래 값을 읽어서 시스템 설정을 구성합니다.

- `mode.control`
- `cameraOption.xDistance`
- `cameraOption.yDistance`
- `cameraOption.zDistance`
- `cameraOption.smoothing`
- `cameraOption.fov`
- `cameraOption.zoom`
- `cameraOption.enableCollision`
- `cameraOption.maxDistance`
- `cameraOption.offset`
- `cameraOption.target`
- `cameraOption.focus`
- `cameraOption.focusTarget`
- `cameraOption.focusDistance`
- `cameraOption.focusLerpSpeed`

즉, 외부에서는 풍부한 `cameraOption`을 넘기고, 내부에서는 `CameraSystemConfig`로 정리해서 사용합니다.

## 자주 쓰는 설정 예시

### 기본 3인칭

```tsx
cameraOption={{
  xDistance: -7,
  yDistance: 10,
  zDistance: -13,
  fov: 75,
  enableCollision: true,
  smoothing: {
    position: 0.25,
    rotation: 0.3,
    fov: 0.2,
  },
}}
```

### 줌 가능 카메라

```tsx
cameraOption={{
  enableZoom: true,
  zoom: 1,
  zoomSpeed: 0.001,
  minZoom: 0.5,
  maxZoom: 2.0,
}}
```

### 포커스 기능 사용

```tsx
cameraOption={{
  enableFocus: true,
  focus: false,
  focusDistance: 15,
  focusLerpSpeed: 5,
}}
```

## 현재 지원 카메라 모드

실제 컨트롤러 기준:

- `thirdPerson`
- `firstPerson`
- `chase`
- `topDown`
- `isometric`
- `sideScroll`
- `fixed`

## 주의할 점

- `cameraOption`은 고수준 입력 타입이고, 그대로 시스템 내부 타입과 일치하지는 않습니다.
- `focusTarget`, `target`, `offset`은 `THREE.Vector3`를 쓰므로 React 직렬화 관점에서는 주의가 필요합니다.
- strict 타입 기준으로 일부 포커스 옵션은 추가 정리가 필요한 상태입니다.

## 함께 보면 좋은 파일

- `src/core/camera/core/types.ts`
- `src/core/camera/bridge/types.ts`
- `src/core/camera/hooks/useCamera.ts`
- `src/core/camera/core/CameraSystem.ts`
