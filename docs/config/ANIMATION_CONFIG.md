# Animation Domain Config Classification

## Store Config (유저 설정값)

초기 설정 또는 유저가 설정 페이지에서 변경하는 값들입니다.

```typescript
type AnimationConfig = {
  defaultFadeTime: number
  defaultTimeScale: number
  defaultLoop: THREE.AnimationActionLoopStyles
  autoBlending: boolean
  qualityLevel: 'low' | 'medium' | 'high'
  animationLODEnabled: boolean
  blendingQuality: number
  compressionEnabled: boolean
  cacheEnabled: boolean
  maxCacheSize: number
  debugMode: boolean
  showBones: boolean
  showAnimationNames: boolean
  updateFrequency: number
}
```

**언제 변경되는가:**
- 유저가 Animation Settings에서 조정
- 게임 시작 시 초기 설정
- 성능 설정 변경 시
- 디버그 모드 토글 시

**데이터 플로우:**
```
Animation Settings UI → Store → Bridge → Core AnimationSystem (1회성 전달)
```

## Constants (절대 불변값)

애니메이션 시스템에서 절대 변하지 않는 상수들입니다.

```typescript
export const ANIMATION_CONSTANTS = {
  MIN_FADE_TIME: 0.0,
  MAX_FADE_TIME: 5.0,
  MIN_TIME_SCALE: 0.1,
  MAX_TIME_SCALE: 5.0,
  MAX_ACTIVE_ACTIONS: 10,
  BLEND_WEIGHT_EPSILON: 0.001,
  ANIMATION_CACHE_LIMIT: 100,
  BONE_COUNT_LIMIT: 200,
  KEYFRAME_INTERPOLATION_THRESHOLD: 0.016,
  MIXER_UPDATE_FREQUENCY: 60,
  MORPH_TARGET_LIMIT: 50,
  ANIMATION_CLIP_MAX_DURATION: 300
} as const
```

**특징:**
- Three.js AnimationMixer 제약
- WebGL 하드웨어 한계
- 성능 보장을 위한 임계값

## Realtime State (매 프레임 변화)

Core Layer에서 관리하며 Store에 절대 저장하면 안 되는 값들입니다.

```typescript
type AnimationState = {
  activeActions: Map<string, THREE.AnimationAction>
  currentAnimation: string | null
  previousAnimation: string | null
  isPlaying: boolean
  isPaused: boolean
  progress: number
  duration: number
  weight: number
  timeScale: number
  blendWeights: Map<string, number>
  morphTargetInfluences: number[]
  boneMatrices: Float32Array
  actionStates: Map<string, {
    time: number
    weight: number
    enabled: boolean
    loop: THREE.AnimationActionLoopStyles
  }>
  transitionState: {
    isTransitioning: boolean
    fromAction: string | null
    toAction: string | null
    progress: number
    duration: number
  }
}

type AnimationMetrics = {
  frameTime: number
  blendingTime: number
  boneCalculationTime: number
  activeActionCount: number
  totalClipCount: number
  memoryUsage: number
  cacheHitRate: number
}
```

**특징:**
- 매 프레임 AnimationMixer에서 업데이트
- Three.js에서 직접 계산
- 본 변형 매트릭스 연산
- React 상태 관리 절대 금지

## 잘못된 분류 예시

```typescript
// ❌ 잘못된 분류 - 이런 값들이 Store에 있으면 안됨
type WrongConfig = {
  currentAnimationName: string        // 실시간 상태 → Realtime State
  isPlaying: boolean                  // 실시간 상태 → Realtime State
  animationProgress: number           // 매 프레임 계산 → Realtime State
  BONE_LIMIT: number                  // 절대 불변 → Constants
}
```

## 올바른 구현 패턴

### Config 변경 시 (1회성)
```typescript
// Settings에서 fade time 변경
const updateFadeTime = (fadeTime: number) => {
  animationStore.setConfig({ defaultFadeTime: fadeTime })
}

// Hook에서 감지하여 Core로 전달
useEffect(() => {
  animationSystem.updateConfig(animationStore.config)
}, [animationStore.config.defaultFadeTime])

// Core에서 적용
class AnimationSystem {
  updateConfig(config: AnimationConfig) {
    this.defaultFadeTime = config.defaultFadeTime
    this.defaultTimeScale = config.defaultTimeScale
    this.blendingQuality = config.blendingQuality
    
    if (config.qualityLevel === 'low') {
      this.enableLOD = true
      this.updateFrequency = 30
    }
  }
}
```

### 실시간 애니메이션 업데이트 (매 프레임)
```typescript
// Core Layer - Store 접근 없이 기존 설정값 사용
class AnimationSystem {
  update(deltaTime: number) {
    this.mixer.update(deltaTime)
    
    this.updateActionWeights()
    this.updateTransitions(deltaTime)
    this.updateBoneMatrices()
    
    if (this.debugMode) {
      this.updateDebugInfo()
    }
  }
  
  private updateActionWeights() {
    this.activeActions.forEach((action, name) => {
      const targetWeight = this.getTargetWeight(name)
      const currentWeight = action.getEffectiveWeight()
      
      if (Math.abs(targetWeight - currentWeight) > ANIMATION_CONSTANTS.BLEND_WEIGHT_EPSILON) {
        action.setEffectiveWeight(
          THREE.MathUtils.lerp(currentWeight, targetWeight, this.blendingQuality)
        )
      }
    })
  }
  
  private updateTransitions(deltaTime: number) {
    if (!this.transitionState.isTransitioning) return
    
    this.transitionState.progress += deltaTime / this.transitionState.duration
    
    if (this.transitionState.progress >= 1) {
      this.completeTransition()
    } else {
      this.interpolateTransition()
    }
  }
}
```

### 애니메이션 상태 머신 (이벤트 드리븐)
```typescript
// Core Layer - 상태 기반 애니메이션 전환
class AnimationStateMachine {
  transitionTo(animationName: string, fadeTime?: number) {
    const currentAction = this.getCurrentAction()
    const nextAction = this.actions.get(animationName)
    
    if (!nextAction) return
    
    const actualFadeTime = fadeTime ?? this.defaultFadeTime
    
    if (currentAction) {
      currentAction.fadeOut(actualFadeTime)
    }
    
    nextAction.reset()
    nextAction.fadeIn(actualFadeTime)
    nextAction.play()
    
    this.currentAnimation = animationName
    this.startTransition(currentAction?.getClip().name || null, animationName, actualFadeTime)
  }
  
  private startTransition(from: string | null, to: string, duration: number) {
    this.transitionState = {
      isTransitioning: true,
      fromAction: from,
      toAction: to,
      progress: 0,
      duration
    }
  }
}
```

### 애니메이션 캐싱 시스템 (메모리 최적화)
```typescript
// Core Layer - 애니메이션 액션 캐싱
class AnimationCache {
  private cache = new Map<string, THREE.AnimationAction>()
  private usageCount = new Map<string, number>()
  
  getAction(clip: THREE.AnimationClip, mixer: THREE.AnimationMixer): THREE.AnimationAction {
    const key = `${clip.name}_${mixer.uuid}`
    
    if (this.cache.has(key)) {
      this.usageCount.set(key, (this.usageCount.get(key) || 0) + 1)
      return this.cache.get(key)!
    }
    
    const action = mixer.clipAction(clip)
    this.addToCache(key, action)
    return action
  }
  
  private addToCache(key: string, action: THREE.AnimationAction) {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed()
    }
    
    this.cache.set(key, action)
    this.usageCount.set(key, 1)
  }
  
  private evictLeastUsed() {
    let minUsage = Infinity
    let keyToEvict = ''
    
    this.usageCount.forEach((count, key) => {
      if (count < minUsage) {
        minUsage = count
        keyToEvict = key
      }
    })
    
    if (keyToEvict) {
      const action = this.cache.get(keyToEvict)
      action?.stop()
      this.cache.delete(keyToEvict)
      this.usageCount.delete(keyToEvict)
    }
  }
}
```

### 애니메이션 LOD 시스템 (성능 최적화)
```typescript
// Core Layer - 거리 기반 애니메이션 품질 조절
class AnimationLODManager {
  updateLOD(distance: number, importance: 'high' | 'medium' | 'low') {
    let qualityMultiplier = 1.0
    let updateFrequency = 60
    
    if (distance > 50) {
      qualityMultiplier = importance === 'high' ? 0.5 : 0.25
      updateFrequency = importance === 'high' ? 30 : 15
    } else if (distance > 20) {
      qualityMultiplier = importance === 'high' ? 0.8 : 0.5
      updateFrequency = importance === 'high' ? 45 : 30
    }
    
    this.activeActions.forEach(action => {
      action.setEffectiveTimeScale(this.defaultTimeScale * qualityMultiplier)
    })
    
    this.mixer.timeScale = qualityMultiplier
  }
}
```

이 분류를 통해 애니메이션 성능 최적화와 메모리 효율성을 보장합니다. 