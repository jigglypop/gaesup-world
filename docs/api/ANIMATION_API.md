# Animation Domain API Reference

## 개요

Animation Domain은 **3D 모델 애니메이션 재생, 상태 전환, 애니메이션 시퀀스 관리**를 담당하는 도메인입니다. Three.js AnimationMixer와 통합되어 복잡한 애니메이션 로직을 체계적으로 관리하고, 게임 상태에 따른 애니메이션 자동 전환을 지원합니다.

**경로**: `src/core/animation/`

## 핵심 시스템

### AnimationBridge

애니메이션 시스템의 메인 브릿지입니다.

```typescript
@DomainBridge('animation')
@EnableMetrics()
class AnimationBridge extends CoreBridge<
  AnimationSystem,
  AnimationSnapshot,
  AnimationCommand
> {
  constructor()
  
  // 애니메이션 시스템 등록
  protected buildEngine(id: string, type: AnimationType): AnimationSystem | null
  
  // 명령 실행
  protected executeCommand(system: AnimationSystem, command: AnimationCommand, id: string): void
  
  // 상태 스냅샷
  protected createSnapshot(system: AnimationSystem, id: string): AnimationSnapshot | null
  
  // 애니메이션 등록
  registerAnimations(type: AnimationType, actions: Record<string, THREE.AnimationAction | null>): void
  
  // 구독 시스템
  subscribe(listener: (snapshot: AnimationSnapshot, type: AnimationType) => void): () => void
}
```

### AnimationSystem

개별 애니메이션 타입의 애니메이션을 관리하는 시스템입니다.

```typescript
class AnimationSystem {
  constructor(type: AnimationType)
  
  // 애니메이션 재생
  play(animationName: string): void
  stop(): void
  pause(): void
  resume(): void
  
  // 애니메이션 등록
  registerAnimations(actions: Record<string, THREE.AnimationAction | null>): void
  setAction(name: string, action: THREE.AnimationAction): void
  
  // 상태 조회
  getCurrentAnimation(): string | null
  isPlaying(): boolean
  getProgress(): number
  getDuration(): number
  
  // 설정
  setFadeTime(fadeTime: number): void
  setTimeScale(scale: number): void
  setLoop(loop: THREE.AnimationActionLoopStyles): void
  
  // 이벤트
  addEventListener(event: string, handler: Function): void
  removeEventListener(event: string, handler: Function): void
  
  // 업데이트
  update(deltaTime: number): void
  dispose(): void
}
```

## Hook APIs

### useAnimationBridge

**메인 Animation 훅** - 애니메이션 시스템과 연동합니다.

```typescript
function useAnimationBridge(): UseAnimationBridgeResult

interface UseAnimationBridgeResult {
  bridge: AnimationBridge | null
  playAnimation: (type: AnimationType, animation: string) => void
  stopAnimation: (type: AnimationType) => void
  executeCommand: (type: AnimationType, command: AnimationCommand) => void
  registerAnimations: (type: AnimationType, actions: Record<string, THREE.AnimationAction | null>) => void
  currentType: AnimationType
  currentAnimation: string
}
```

**사용 예제**:
```typescript
function AnimatedCharacter() {
  const { playAnimation, stopAnimation, currentAnimation } = useAnimationBridge()
  
  const handleWalk = () => {
    playAnimation('character', 'walk')
  }
  
  const handleRun = () => {
    playAnimation('character', 'run')
  }
  
  const handleIdle = () => {
    playAnimation('character', 'idle')
  }
  
  return (
    <div>
      <div>Current Animation: {currentAnimation}</div>
      <button onClick={handleIdle}>Idle</button>
      <button onClick={handleWalk}>Walk</button>
      <button onClick={handleRun}>Run</button>
      <button onClick={() => stopAnimation('character')}>Stop</button>
    </div>
  )
}
```

### useAnimationPlayer

**애니메이션 자동 재생 훅** - 게임 상태에 따라 자동으로 애니메이션을 전환합니다.

```typescript
function useAnimationPlayer(enabled: boolean): void
```

**특징**:
- 자동 애니메이션 상태 전환
- 게임 모드에 따른 애니메이션 선택
- 상태 변화 감지 및 자동 재생

### useAnimationSetup

애니메이션 초기화를 담당하는 훅입니다.

```typescript
function useAnimationSetup(
  actions: Record<string, THREE.AnimationAction | null> | null,
  modeType: ModeType | undefined,
  isActive: boolean
): void
```

## 컴포넌트 APIs

### AnimationController

애니메이션 재생을 제어하는 UI 컴포넌트입니다.

```typescript
function AnimationController(): JSX.Element
```

**기능**:
- 미리 정의된 애니메이션 목록 표시
- 클릭으로 애니메이션 재생
- 현재 재생 중인 애니메이션 표시

**애니메이션 모드**:
```typescript
const ANIMATION_MODES = [
  { value: 'idle', label: 'Idle' },
  { value: 'walk', label: 'Walk' },
  { value: 'run', label: 'Run' },
  { value: 'jump', label: 'Jump' },
  { value: 'fall', label: 'Fall' },
  { value: 'dance', label: 'Dance' },
  { value: 'wave', label: 'Wave' }
]
```

### AnimationPlayer

고급 애니메이션 재생 컨트롤을 제공하는 컴포넌트입니다.

```typescript
function AnimationPlayer(): JSX.Element
```

**기능**:
- 재생/일시정지/정지 컨트롤
- 재생 속도 조절
- 반복 모드 설정
- 진행률 표시 및 탐색

### AnimationDebugPanel

애니메이션 상태를 시각화하는 디버그 패널입니다.

```typescript
function AnimationDebugPanel(): JSX.Element
```

**기능**:
- 현재 재생 중인 애니메이션 정보
- 재생 진행률 및 시간
- 등록된 애니메이션 목록
- 애니메이션 시스템 메트릭스

## 타입 정의

### AnimationType

지원되는 애니메이션 타입입니다.

```typescript
type AnimationType = 'character' | 'vehicle' | 'airplane'
```

### AnimationCommand

애니메이션 시스템에 전송되는 명령입니다.

```typescript
interface AnimationCommand {
  type: 'play' | 'stop' | 'pause' | 'resume' | 'setFadeTime' | 'setTimeScale' | 'setLoop'
  animation?: string
  fadeTime?: number
  timeScale?: number
  loop?: THREE.AnimationActionLoopStyles
}
```

### AnimationSnapshot

애니메이션 시스템의 현재 상태 스냅샷입니다.

```typescript
interface AnimationSnapshot {
  currentAnimation: string | null
  isPlaying: boolean
  progress: number
  duration: number
  fadeTime: number
  timeScale: number
  loop: THREE.AnimationActionLoopStyles
  registeredAnimations: string[]
  metrics: {
    frameTime: number
    updateCount: number
    lastUpdate: number
  }
}
```

### AnimationSlice

Zustand 스토어의 애니메이션 슬라이스입니다.

```typescript
interface AnimationSlice {
  animationState: Record<AnimationType, {
    current: string
    isPlaying: boolean
    progress: number
  }>
  setAnimation: (type: AnimationType, animation: string) => void
  setAnimationPlaying: (type: AnimationType, isPlaying: boolean) => void
  setAnimationProgress: (type: AnimationType, progress: number) => void
}
```

## 명령 시스템 사용법

### 기본 애니메이션 명령

```typescript
// 애니메이션 재생
const playCommand: AnimationCommand = {
  type: 'play',
  animation: 'walk'
}

// 애니메이션 정지
const stopCommand: AnimationCommand = {
  type: 'stop'
}

// 일시정지
const pauseCommand: AnimationCommand = {
  type: 'pause'
}

// 재생 재개
const resumeCommand: AnimationCommand = {
  type: 'resume'
}
```

### 고급 설정 명령

```typescript
// 페이드 시간 설정
const fadeCommand: AnimationCommand = {
  type: 'setFadeTime',
  fadeTime: 0.5
}

// 재생 속도 설정
const speedCommand: AnimationCommand = {
  type: 'setTimeScale',
  timeScale: 1.5
}

// 반복 모드 설정
const loopCommand: AnimationCommand = {
  type: 'setLoop',
  loop: THREE.LoopRepeat
}
```

## 고급 사용법

### 커스텀 애니메이션 시스템

```typescript
function useCustomAnimationSystem(type: AnimationType) {
  const { registerAnimations, executeCommand } = useAnimationBridge()
  const [customAnimations, setCustomAnimations] = useState<Record<string, THREE.AnimationAction>>({})
  
  const registerCustomAnimation = useCallback((name: string, action: THREE.AnimationAction) => {
    setCustomAnimations(prev => ({
      ...prev,
      [name]: action
    }))
    
    registerAnimations(type, {
      ...customAnimations,
      [name]: action
    })
  }, [type, registerAnimations, customAnimations])
  
  const playCustomAnimation = useCallback((name: string, options?: {
    fadeTime?: number
    timeScale?: number
    loop?: THREE.AnimationActionLoopStyles
  }) => {
    if (options?.fadeTime) {
      executeCommand(type, { type: 'setFadeTime', fadeTime: options.fadeTime })
    }
    if (options?.timeScale) {
      executeCommand(type, { type: 'setTimeScale', timeScale: options.timeScale })
    }
    if (options?.loop) {
      executeCommand(type, { type: 'setLoop', loop: options.loop })
    }
    
    executeCommand(type, { type: 'play', animation: name })
  }, [type, executeCommand])
  
  return {
    registerCustomAnimation,
    playCustomAnimation,
    customAnimations
  }
}
```

### 애니메이션 시퀀스 관리

```typescript
function useAnimationSequence() {
  const { playAnimation } = useAnimationBridge()
  
  const playSequence = useCallback(async (
    type: AnimationType,
    sequence: Array<{ animation: string; duration: number }>
  ) => {
    for (const step of sequence) {
      playAnimation(type, step.animation)
      await new Promise(resolve => setTimeout(resolve, step.duration))
    }
  }, [playAnimation])
  
  const createCombatSequence = useCallback((type: AnimationType) => {
    return playSequence(type, [
      { animation: 'prepare', duration: 500 },
      { animation: 'attack', duration: 800 },
      { animation: 'recover', duration: 300 },
      { animation: 'idle', duration: 0 }
    ])
  }, [playSequence])
  
  const createDanceSequence = useCallback((type: AnimationType) => {
    return playSequence(type, [
      { animation: 'dance1', duration: 2000 },
      { animation: 'dance2', duration: 2000 },
      { animation: 'dance3', duration: 2000 },
      { animation: 'bow', duration: 1000 },
      { animation: 'idle', duration: 0 }
    ])
  }, [playSequence])
  
  return {
    playSequence,
    createCombatSequence,
    createDanceSequence
  }
}
```

### 상태 기반 애니메이션 자동화

```typescript
function useStateBasedAnimation() {
  const { playAnimation } = useAnimationBridge()
  const { activeState } = useStateSystem()
  const { keyboard } = useInteractionSystem()
  
  useEffect(() => {
    const type: AnimationType = activeState.mode || 'character'
    
    // 움직임 상태에 따른 애니메이션
    if (activeState.isMoving) {
      if (keyboard.shift) {
        playAnimation(type, 'run')
      } else {
        playAnimation(type, 'walk')
      }
    } else {
      playAnimation(type, 'idle')
    }
    
    // 공중 상태 확인
    if (!activeState.isGrounded) {
      if (activeState.velocity.y > 0) {
        playAnimation(type, 'jump')
      } else {
        playAnimation(type, 'fall')
      }
    }
    
    // 건강 상태에 따른 애니메이션
    if (activeState.health < 0.3) {
      playAnimation(type, 'injured')
    }
    
  }, [activeState, keyboard, playAnimation])
}
```

### 애니메이션 이벤트 처리

```typescript
function useAnimationEvents() {
  const bridge = useRef<AnimationBridge | null>(null)
  
  useEffect(() => {
    const animationBridge = getGlobalAnimationBridge()
    bridge.current = animationBridge
    
    const handleAnimationComplete = (type: AnimationType, animation: string) => {
      console.log(`Animation ${animation} completed for ${type}`)
      
      // 특정 애니메이션 완료 시 자동 전환
      if (animation === 'attack') {
        animationBridge.executeCommand(type, { type: 'play', animation: 'idle' })
      }
    }
    
    const handleAnimationStart = (type: AnimationType, animation: string) => {
      console.log(`Animation ${animation} started for ${type}`)
    }
    
    // 이벤트 리스너 등록
    animationBridge.addEventListener('animationComplete', handleAnimationComplete)
    animationBridge.addEventListener('animationStart', handleAnimationStart)
    
    return () => {
      animationBridge.removeEventListener('animationComplete', handleAnimationComplete)
      animationBridge.removeEventListener('animationStart', handleAnimationStart)
    }
  }, [])
}
```

### 애니메이션 블렌딩

```typescript
function useAnimationBlending() {
  const { executeCommand } = useAnimationBridge()
  
  const blendAnimations = useCallback((
    type: AnimationType,
    fromAnimation: string,
    toAnimation: string,
    blendTime: number = 0.3
  ) => {
    // 페이드 시간 설정
    executeCommand(type, {
      type: 'setFadeTime',
      fadeTime: blendTime
    })
    
    // 새 애니메이션 재생 (자동으로 블렌딩됨)
    executeCommand(type, {
      type: 'play',
      animation: toAnimation
    })
  }, [executeCommand])
  
  const smoothTransition = useCallback((
    type: AnimationType,
    targetAnimation: string
  ) => {
    // 현재 애니메이션에 따라 다른 블렌딩 시간 적용
    const currentAnimation = getCurrentAnimation(type) // 구현 필요
    
    let blendTime = 0.3
    if (currentAnimation === 'run' && targetAnimation === 'idle') {
      blendTime = 0.5 // 달리기에서 멈춤은 더 긴 블렌딩
    } else if (currentAnimation === 'idle' && targetAnimation === 'attack') {
      blendTime = 0.1 // 공격 시작은 빠른 블렌딩
    }
    
    blendAnimations(type, currentAnimation, targetAnimation, blendTime)
  }, [blendAnimations])
  
  return {
    blendAnimations,
    smoothTransition
  }
}
```

## 성능 최적화

### 1. 애니메이션 LOD (Level of Detail)

```typescript
function useAnimationLOD(distance: number, importance: 'high' | 'medium' | 'low') {
  const { executeCommand } = useAnimationBridge()
  
  useEffect(() => {
    let updateFrequency = 1.0 // 기본 업데이트 주파수
    
    // 거리와 중요도에 따른 품질 조절
    if (distance > 50) {
      updateFrequency = importance === 'high' ? 0.5 : 0.25
    } else if (distance > 20) {
      updateFrequency = importance === 'high' ? 0.8 : 0.5
    }
    
    executeCommand('character', {
      type: 'setTimeScale',
      timeScale: updateFrequency
    })
  }, [distance, importance, executeCommand])
}
```

### 2. 조건부 애니메이션 업데이트

```typescript
function useConditionalAnimation(isVisible: boolean, isImportant: boolean) {
  const shouldAnimate = isVisible || isImportant
  
  useAnimationPlayer(shouldAnimate)
  
  return shouldAnimate
}
```

### 3. 애니메이션 풀링

```typescript
function useAnimationPool() {
  const animationPool = useRef<Map<string, THREE.AnimationAction>>(new Map())
  
  const getPooledAnimation = useCallback((name: string, clip: THREE.AnimationClip, mixer: THREE.AnimationMixer) => {
    const poolKey = `${name}_${clip.uuid}`
    
    if (!animationPool.current.has(poolKey)) {
      const action = mixer.clipAction(clip)
      animationPool.current.set(poolKey, action)
    }
    
    return animationPool.current.get(poolKey)!
  }, [])
  
  const clearPool = useCallback(() => {
    animationPool.current.clear()
  }, [])
  
  return {
    getPooledAnimation,
    clearPool
  }
}
```

## 디버깅 도구

### 애니메이션 상태 모니터

```typescript
function AnimationStateMonitor() {
  const [animationStates, setAnimationStates] = useState<Record<AnimationType, AnimationSnapshot>>({})
  
  useEffect(() => {
    const bridge = getGlobalAnimationBridge()
    
    const updateStates = () => {
      const types: AnimationType[] = ['character', 'vehicle', 'airplane']
      const states = {} as Record<AnimationType, AnimationSnapshot>
      
      types.forEach(type => {
        const snapshot = bridge.snapshot(type)
        if (snapshot) {
          states[type] = snapshot
        }
      })
      
      setAnimationStates(states)
    }
    
    const interval = setInterval(updateStates, 100)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: 10 }}>
      <h3>Animation States</h3>
      {Object.entries(animationStates).map(([type, state]) => (
        <div key={type}>
          <h4>{type}</h4>
          <div>Current: {state.currentAnimation}</div>
          <div>Playing: {state.isPlaying ? 'Yes' : 'No'}</div>
          <div>Progress: {(state.progress * 100).toFixed(1)}%</div>
          <div>Time Scale: {state.timeScale}</div>
        </div>
      ))}
    </div>
  )
}
```

### 애니메이션 타임라인

```typescript
function AnimationTimeline({ type }: { type: AnimationType }) {
  const [timeline, setTimeline] = useState<Array<{ time: number; animation: string }>>([])
  
  useEffect(() => {
    const bridge = getGlobalAnimationBridge()
    
    const handleAnimationChange = (animationType: AnimationType, animation: string) => {
      if (animationType === type) {
        setTimeline(prev => [
          ...prev.slice(-10), // 최근 10개만 유지
          { time: Date.now(), animation }
        ])
      }
    }
    
    bridge.addEventListener('animationStart', handleAnimationChange)
    
    return () => {
      bridge.removeEventListener('animationStart', handleAnimationChange)
    }
  }, [type])
  
  return (
    <div>
      <h3>Animation Timeline - {type}</h3>
      {timeline.map((entry, index) => (
        <div key={index}>
          {new Date(entry.time).toLocaleTimeString()}: {entry.animation}
        </div>
      ))}
    </div>
  )
}
```

이 API 가이드는 Animation Domain의 모든 기능을 체계적으로 설명하며, 기본 애니메이션 재생부터 복잡한 상태 기반 자동화까지 애니메이션 시스템을 완전히 활용할 수 있는 레퍼런스를 제공합니다. 