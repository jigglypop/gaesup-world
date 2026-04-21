# 카메라 도메인

## 개요

Gaesup World의 카메라 도메인은 플레이어 상태와 월드 상태를 기준으로 카메라 위치와 시선을 계산하는 시스템입니다. 현재 구조는 코어 계산, 브리지, 훅, React 컴포넌트가 나뉘어 있습니다.

핵심 구성:

- 시스템: `CameraSystem`
- 브리지 계층: `BaseCameraSystem`, `useCameraBridge`
- 훅: `useCamera`
- 컨트롤러: `ThirdPersonController`, `FirstPersonController`, `ChaseController` 등
- 컴포넌트: `Camera`, `CameraController`, `CameraPresets`, `CameraDebugPanel`

## 관련 경로

- `src/core/camera/core/`
- `src/core/camera/bridge/`
- `src/core/camera/controllers/`
- `src/core/camera/hooks/`
- `src/core/camera/components/`
- `src/core/camera/stores/`
- `src/core/camera/utils/`

## 현재 지원 카메라 모드

코드 기준으로 아래 컨트롤러들이 등록되어 있습니다.

- `thirdPerson`
- `firstPerson`
- `chase`
- `topDown`
- `isometric`
- `sideScroll`
- `fixed`

`CameraSystem`은 내부 `controllers` 맵에 이 컨트롤러들을 등록해두고, 현재 모드에 맞는 컨트롤러를 실행합니다.

## 주요 구성 요소

### `CameraSystem`

카메라 계산의 중심 시스템입니다.

역할:

- 컨트롤러 등록 및 선택
- 카메라 상태 초기화
- 설정 반영
- 프레임별 카메라 계산 호출
- 카메라 상태 전환 정보 관리

초기 기본 설정에는 아래 항목들이 포함됩니다.

- 모드
- 거리(`x`, `y`, `z`)
- 충돌 사용 여부
- 보간값(`smoothing`)
- FOV
- 줌

### 컨트롤러 계층

각 컨트롤러는 특정 시점 규칙을 담당합니다.

- `ThirdPersonController`: 일반적인 3인칭 시점
- `FirstPersonController`: 1인칭 시점
- `ChaseController`: 캐릭터 방향을 따라가는 추적 시점
- `TopDownController`: 위에서 내려다보는 시점
- `IsometricController`: 등각 시점
- `SideScrollController`: 횡스크롤 스타일 시점
- `FixedController`: 고정 카메라

즉, 카메라 동작의 차이는 대부분 컨트롤러 단위로 분리됩니다.

### `useCamera`

React 쪽에서 실제 카메라 시스템을 연결하는 핵심 훅입니다.

주요 동작:

- `useThree()`로 현재 카메라와 렌더러 접근
- `useStateSystem()`에서 플레이어 active state 수신
- `gaesupStore`의 `cameraOption`, `mode` 구독
- `useCameraBridge()`로 `CameraSystem` 생성/연결
- `useFrame()`에서 매 프레임 `system.calculate()` 호출
- 휠 줌 처리
- 포커스 해제(`Escape`) 처리

즉, 카메라 도메인의 실제 실행 루프는 `useCamera()` 안에 모여 있습니다.

### `Camera`

보통 외부에서는 `Camera` 컴포넌트를 통해 카메라 훅이 적용됩니다. `GaesupWorldContent` 내부에서도 이 컴포넌트를 사용합니다.

### UI 컴포넌트

- `CameraController`: 카메라 조작용 UI
- `CameraPresets`: 프리셋 선택 UI
- `CameraDebugPanel`: 현재 카메라 상태를 확인하는 디버그 UI

## 설정 흐름

카메라 설정은 주로 `useGaesupStore().cameraOption`과 `mode.control`에서 들어옵니다.

대표 항목:

- `xDistance`
- `yDistance`
- `zDistance`
- `fov`
- `zoom`
- `enableCollision`
- `enableZoom`
- `enableFocus`
- `focus`
- `focusTarget`
- `focusDistance`
- `focusLerpSpeed`
- `smoothing`

`useCamera()`는 이 값을 브리지 설정 형식으로 변환해서 `CameraSystem`에 반영합니다.

## 동작 흐름

1. 외부에서 `GaesupWorld` 또는 store를 통해 카메라 옵션을 설정합니다.
2. `Camera` 컴포넌트가 `useCamera()`를 실행합니다.
3. `useCamera()`가 `CameraSystem`과 브리지를 연결합니다.
4. `useFrame()`마다 현재 플레이어 상태와 카메라 옵션을 시스템에 전달합니다.
5. 현재 모드에 맞는 컨트롤러가 카메라 위치와 시선을 계산합니다.
6. 결과가 실제 `three.js` 카메라에 반영됩니다.

## 현재 강점

- 모드별 책임이 컨트롤러 단위로 잘 분리되어 있습니다.
- store 기반 옵션과 프레임 계산이 연결되어 있어 확장성이 좋습니다.
- 줌, 포커스, 충돌, 시점 전환 같은 옵션을 한 도메인에서 관리할 수 있습니다.
- React 쪽 사용법은 `Camera` 또는 `useCamera()`로 비교적 단순합니다.

## 현재 한계

- 옵션 타입이 풍부한 대신 흐름이 복잡해서 문서 없이 파악하기 어렵습니다.
- 일부 포커스/옵션 관련 타입은 strict 타입 설정에서 정리가 더 필요합니다.
- 컨트롤러별 실제 차이점과 추천 사용처를 UI 수준에서 더 명확히 안내할 필요가 있습니다.

## 사용 예시

```tsx
import { GaesupWorld } from 'gaesup-world';

<GaesupWorld
  mode={{ type: 'character', controller: 'keyboard', control: 'chase' }}
  cameraOption={{
    xDistance: -7,
    yDistance: 10,
    zDistance: -13,
    fov: 75,
    enableCollision: true,
    zoom: 1,
  }}
>
  {/* world contents */}
</GaesupWorld>
```

## 함께 보면 좋은 파일

- `src/core/camera/core/CameraSystem.ts`
- `src/core/camera/hooks/useCamera.ts`
- `src/core/camera/controllers/ThirdPersonController.ts`
- `src/core/camera/controllers/ChaseController.ts`
- `src/core/camera/components/CameraPresets/index.tsx`
- `src/core/camera/components/CameraDebugPanel/index.tsx`
