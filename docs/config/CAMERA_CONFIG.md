# Camera Component Settings

> 언리얼 엔진의 Camera Component와 유니티의 Camera를 참고한 카메라 설정

## Core Settings

### Camera Component Config
```typescript
interface CameraSettings {
  // Projection Settings (유니티: Camera Component)
  fieldOfView: number;              // 기본: 75 (유니티: Field of View)
  nearClipPlane: number;            // 기본: 0.1 (유니티: Near)
  farClipPlane: number;             // 기본: 1000 (유니티: Far)
  orthographicSize: number;         // 유니티: Size (Orthographic)
  
  // Transform Settings
  position: Vector3;                // 카메라 위치
  rotation: Euler;                  // 카메라 회전
  target: Vector3;                  // 바라볼 대상 (언리얼: Look At)
  
  // Follow Settings (Third Person)
  followDistance: number;           // 기본: 10 (언리얼: Target Distance)
  followHeight: number;             // 기본: 5 (수직 오프셋)
  followSpeed: number;              // 기본: 5.0 (따라가기 속도)
}
```

### Camera Controller Settings  
```typescript
interface CameraControllerSettings {
  // Control Mode (언리얼: Camera Style)
  cameraMode: 'thirdPerson' | 'firstPerson' | 'topDown' | 'sideScroll' | 'free';
  
  // Input Settings (언리얼: Input Settings)
  mouseSensitivity: number;         // 기본: 1.0 (마우스 민감도)
  invertY: boolean;                 // Y축 반전
  smoothing: number;                // 기본: 0.1 (카메라 부드러움)
  
  // Collision Settings (언리얼: Camera Collision)
  enableCollision: boolean;         // 충돌 감지 활성화
  collisionRadius: number;          // 기본: 0.5 (충돌 반지름)
  collisionOffset: number;          // 기본: 0.1 (충돌 오프셋)
}
```

### Third Person Camera Settings
```typescript
interface ThirdPersonCameraSettings {
  // Distance Settings (언리얼: Spring Arm)
  targetArmLength: number;          // 기본: 300 (언리얼: Target Arm Length)
  minDistance: number;              // 기본: 2.0 (최소 거리)
  maxDistance: number;              // 기본: 50.0 (최대 거리)
  
  // Angle Settings
  pitchMin: number;                 // 기본: -80 (최소 피치)
  pitchMax: number;                 // 기본: 80 (최대 피치)
  yawSpeed: number;                 // 기본: 2.0 (요 속도)
  pitchSpeed: number;               // 기본: 1.5 (피치 속도)
  
  // Lag Settings (언리얼: Camera Lag)
  enableCameraLag: boolean;         // 카메라 지연 활성화
  cameraLagSpeed: number;           // 기본: 10.0 (지연 속도)
  cameraRotationLag: boolean;       // 회전 지연
  cameraRotationLagSpeed: number;   // 기본: 10.0 (회전 지연 속도)
}
```

## Quality Settings

### Rendering Settings
```typescript
interface CameraRenderingSettings {
  // Quality (유니티: Quality Settings)
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  antiAliasing: 'none' | 'fxaa' | 'smaa' | 'msaa_2x' | 'msaa_4x';
  
  // Effects
  enablePostProcessing: boolean;    // 포스트 프로세싱 활성화
  enableBloom: boolean;             // 블룸 효과
  enableVignette: boolean;          // 비네트 효과
  enableMotionBlur: boolean;        // 모션 블러
  
  // Performance
  cullingMask: string[];            // 렌더링할 레이어 (유니티: Culling Mask)
  renderDistance: number;           // 렌더링 거리
}
```

## User Controls

### Player Camera Preferences
```typescript
interface PlayerCameraSettings {
  // Accessibility
  fieldOfViewScale: number;         // 기본: 1.0 (FOV 스케일)
  uiScale: number;                  // 기본: 1.0 (UI 스케일)
  enableCameraShake: boolean;       // 카메라 흔들림
  
  // Comfort Settings
  motionSickness: 'none' | 'reduced' | 'comfort';
  enableHeadBob: boolean;           // 머리 흔들림
  mouseSmoothness: number;          // 마우스 부드러움
  
  // Debug
  showCameraInfo: boolean;          // 카메라 정보 표시
  showFrustum: boolean;             // 절두체 표시
}
```

## Default Configuration

```typescript
export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  fieldOfView: 75,
  nearClipPlane: 0.1,
  farClipPlane: 1000,
  orthographicSize: 5,
  position: { x: 0, y: 5, z: 10 },
  rotation: { x: -15, y: 0, z: 0 },
  target: { x: 0, y: 0, z: 0 },
  followDistance: 10,
  followHeight: 5,
  followSpeed: 5.0,
};

export const DEFAULT_CONTROLLER_SETTINGS: CameraControllerSettings = {
  cameraMode: 'thirdPerson',
  mouseSensitivity: 1.0,
  invertY: false,
  smoothing: 0.1,
  enableCollision: true,
  collisionRadius: 0.5,
  collisionOffset: 0.1,
};

export const DEFAULT_THIRD_PERSON_SETTINGS: ThirdPersonCameraSettings = {
  targetArmLength: 300,
  minDistance: 2.0,
  maxDistance: 50.0,
  pitchMin: -80,
  pitchMax: 80,
  yawSpeed: 2.0,
  pitchSpeed: 1.5,
  enableCameraLag: true,
  cameraLagSpeed: 10.0,
  cameraRotationLag: true,
  cameraRotationLagSpeed: 10.0,
};
```

## Settings Overview

### Camera Core Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| fieldOfView | 75 | 10 - 120 | 시야각 (degrees) |
| nearClipPlane | 0.1 | 0.01 - 10 | 근거리 클리핑 평면 |
| farClipPlane | 1000 | 100 - 10000 | 원거리 클리핑 평면 |
| followDistance | 10 | 2 - 50 | 추적 거리 |
| followHeight | 5 | 0 - 20 | 수직 오프셋 |
| followSpeed | 5.0 | 0.1 - 20.0 | 따라가기 속도 |

### Camera Controller Settings
| 설정 | 기본값 | 옵션 | 설명 |
|------|--------|------|------|
| cameraMode | 'thirdPerson' | thirdPerson/firstPerson/topDown/sideScroll/free | 카메라 모드 |
| mouseSensitivity | 1.0 | 0.1 - 5.0 | 마우스 민감도 |
| invertY | false | true/false | Y축 반전 |
| smoothing | 0.1 | 0.0 - 1.0 | 카메라 부드러움 |
| enableCollision | true | true/false | 충돌 감지 활성화 |
| collisionRadius | 0.5 | 0.1 - 2.0 | 충돌 반지름 |

### Third Person Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| targetArmLength | 300 | 50 - 1000 | 타겟 암 길이 |
| minDistance | 2.0 | 0.5 - 10.0 | 최소 거리 |
| maxDistance | 50.0 | 10.0 - 200.0 | 최대 거리 |
| pitchMin | -80 | -89 - 0 | 최소 피치 각도 |
| pitchMax | 80 | 0 - 89 | 최대 피치 각도 |
| enableCameraLag | true | true/false | 카메라 지연 활성화 |
| cameraLagSpeed | 10.0 | 1.0 - 50.0 | 지연 속도 |

### Rendering Quality
| 품질 레벨 | Anti-aliasing | Post-processing | 권장 환경 |
|----------|---------------|-----------------|-----------|
| low | none | false | 저사양 디바이스 |
| medium | fxaa | basic | 일반 PC |
| high | smaa | enabled | 고사양 PC |
| ultra | msaa_4x | full | 최고사양 PC |

## Usage Example

```typescript
// 카메라 설정 변경
const { updateCameraSettings } = useCameraStore();

updateCameraSettings({
  fieldOfView: 90,              // 더 넓은 시야각
  mouseSensitivity: 1.5,        // 더 민감한 마우스
  enableCollision: false        // 충돌 감지 비활성화
});
```

## Camera Presets

```typescript
// 미리 정의된 카메라 프리셋
export const CAMERA_PRESETS = {
  cinematic: {
    fieldOfView: 35,
    followDistance: 15,
    enableMotionBlur: true,
    cameraLagSpeed: 5.0,
  },
  
  action: {
    fieldOfView: 90,
    followDistance: 8,
    enableMotionBlur: false,
    cameraLagSpeed: 15.0,
  },
  
  exploration: {
    fieldOfView: 75,
    followDistance: 12,
    enableCollision: true,
    renderDistance: 100,
    }
};
``` 