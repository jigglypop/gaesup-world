# Animation Controller Settings

> 언리얼 엔진의 Animation Blueprint와 유니티의 Animator Controller를 참고한 애니메이션 설정

## Core Settings

### Animation Controller Config
```typescript
interface AnimationControllerSettings {
  // Playback Settings
  playbackSpeed: number;           // 기본: 1.0 (언리얼: Play Rate)
  blendDuration: number;           // 기본: 0.3초 (언리얼: Blend Time)
  loopMode: 'none' | 'loop' | 'pingpong'; // 유니티: Loop Time
  
  // Quality Settings
  updateMode: 'normal' | 'animatePhysics' | 'unscaledTime'; // 유니티: Update Mode
  cullingType: 'alwaysAnimate' | 'cullUpdateTransforms' | 'cullCompletely'; // 유니티: Culling Type
  
  // Performance
  enableRootMotion: boolean;       // 언리얼: Enable Root Motion
  enableOptimization: boolean;     // 자동 최적화 활성화
}
```

### Blend Tree Settings
```typescript
interface BlendTreeSettings {
  // Blend Parameters (언리얼: Blend Space)
  movementBlend: {
    walkThreshold: number;         // 기본: 0.1 (걷기 시작 속도)
    runThreshold: number;          // 기본: 5.0 (뛰기 시작 속도)
    blendSharpness: number;        // 기본: 2.0 (블렌드 예리함)
  };
  
  // State Transitions (유니티: Transition)
  transitionSettings: {
    hasExitTime: boolean;          // 유니티: Has Exit Time
    exitTime: number;              // 유니티: Exit Time (0.0 ~ 1.0)
    fixedDuration: boolean;        // 유니티: Fixed Duration
    transitionDuration: number;    // 유니티: Transition Duration
  };
}
```

## User Controls

### Runtime Animation Settings
```typescript
interface RuntimeAnimationSettings {
  // Player Preferences
  animationQuality: 'low' | 'medium' | 'high';
  showDebugInfo: boolean;
  enableAnimationEvents: boolean;
  
  // Developer Tools (Editor Only)
  debugMode: boolean;
  showBones: boolean;
  showBlendWeights: boolean;
}
```

## Default Configuration

```typescript
export const DEFAULT_ANIMATION_SETTINGS: AnimationControllerSettings = {
  playbackSpeed: 1.0,
  blendDuration: 0.3,
  loopMode: 'loop',
  updateMode: 'normal',
  cullingType: 'cullUpdateTransforms',
  enableRootMotion: true,
  enableOptimization: true,
};

export const DEFAULT_RUNTIME_SETTINGS: RuntimeAnimationSettings = {
  animationQuality: 'high',
  showDebugInfo: false,
  enableAnimationEvents: true,
  debugMode: false,
  showBones: false,
  showBlendWeights: false,
};
```

## Settings Overview

### Animation Controller Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| playbackSpeed | 1.0 | 0.1 - 5.0 | 애니메이션 재생 속도 |
| blendDuration | 0.3 | 0.0 - 2.0 | 애니메이션 블렌드 시간 (초) |
| loopMode | 'loop' | none/loop/pingpong | 애니메이션 반복 모드 |
| updateMode | 'normal' | normal/animatePhysics/unscaledTime | 업데이트 모드 |
| cullingType | 'cullUpdateTransforms' | alwaysAnimate/cullUpdateTransforms/cullCompletely | 컬링 타입 |
| enableRootMotion | true | true/false | 루트 모션 활성화 |
| enableOptimization | true | true/false | 자동 최적화 활성화 |

### Blend Tree Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| walkThreshold | 0.1 | 0.0 - 1.0 | 걷기 시작 속도 임계값 |
| runThreshold | 5.0 | 1.0 - 20.0 | 뛰기 시작 속도 임계값 |
| blendSharpness | 2.0 | 0.1 - 10.0 | 블렌드 예리함 |
| hasExitTime | true | true/false | 종료 시간 사용 여부 |
| exitTime | 0.8 | 0.0 - 1.0 | 종료 시간 비율 |
| transitionDuration | 0.25 | 0.0 - 2.0 | 전환 지속 시간 |

### Quality Settings
| 품질 레벨 | 설명 | 권장 환경 |
|----------|------|-----------|
| low | 최소한의 애니메이션, 모바일 최적화 | 저사양 디바이스 |
| medium | 기본 애니메이션, 균형잡힌 성능 | 일반 PC |
| high | 고품질 애니메이션, 부드러운 블렌딩 | 고사양 PC |

## Usage Example

```typescript
// 사용자 설정 변경
const { updateAnimationSettings } = useAnimationStore();

updateAnimationSettings({
  playbackSpeed: 1.5,        // 1.5배속 재생
  animationQuality: 'medium' // 중간 품질
});
``` 