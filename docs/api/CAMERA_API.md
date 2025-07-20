# Camera Domain API Reference

## 개요

Camera Domain은 **다양한 카메라 모드와 컨트롤러, 카메라 전환 및 애니메이션**을 담당하는 도메인입니다. 게임에서 자주 사용되는 카메라 시점들을 제공하고, 부드러운 전환과 동적 설정 변경을 지원합니다.

**경로**: `src/core/camera/`

## 핵심 시스템

### CameraSystem

카메라 시스템의 메인 관리 클래스입니다.

```typescript
@ManageRuntime({ autoStart: false })
class CameraSystem extends BaseCameraSystem {
  constructor(config: CameraSystemConfig)
  
  // 컨트롤러 관리
  registerController(controller: ICameraController): void
  getController(name: string): ICameraController | undefined
  setActiveController(name: string): void
  
  // 카메라 상태 관리
  getCameraState(name: string): CameraState | undefined
  setCameraState(name: string, state: CameraState): void
  addCameraTransition(transition: CameraTransition): void
  
  // 계산 및 업데이트
  calculateCamera(props: CameraCalcProps): {
    position: THREE.Vector3
    lookAt: THREE.Vector3
  }
  
  // 설정 및 상태
  updateConfig(config: Partial<CameraSystemConfig>): void
  getState(): CameraSystemState
  getMetrics(): CameraSystemMetrics
  
  // 생명주기
  update(deltaTime: number): void
  destroy(): void
}
```

### BaseCameraSystem

카메라 시스템의 기반 클래스입니다.

```typescript
abstract class BaseCameraSystem {
  constructor(config: CameraSystemConfig)
  
  // 추상 메서드 (하위 클래스에서 구현)
  abstract calculateCamera(props: CameraCalcProps): {
    position: THREE.Vector3
    lookAt: THREE.Vector3
  }
  
  // 공통 기능
  updateConfig(config: Partial<CameraSystemConfig>): void
  getConfig(): CameraSystemConfig
  getState(): any
  getMetrics(): any
  
  // 이벤트 시스템
  emitter: EventEmitter
  
  // 생명주기
  update(deltaTime: number): void
  destroy(): void
}
```

## 카메라 컨트롤러

### BaseController

모든 카메라 컨트롤러의 기반 클래스입니다.

```typescript
abstract class BaseController implements ICameraController {
  abstract name: string
  abstract defaultConfig: Partial<CameraSystemConfig>
  
  // 위치 계산 (필수 구현)
  abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
  
  // 시선 계산 (기본 구현 제공)
  calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### ThirdPersonController

3인칭 시점 카메라 컨트롤러입니다.

```typescript
class ThirdPersonController extends BaseController {
  name = 'thirdPerson'
  
  defaultConfig = {
    distance: 10,
    height: 5,
    angle: 0,
    smoothing: 0.1,
    collisionChecks: true
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### FirstPersonController

1인칭 시점 카메라 컨트롤러입니다.

```typescript
class FirstPersonController extends BaseController {
  name = 'firstPerson'
  
  defaultConfig = {
    height: 1.7,
    smoothing: 0.05,
    bobbing: true,
    bobbingIntensity: 0.1
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### ChaseController

추적 카메라 컨트롤러입니다.

```typescript
class ChaseController extends BaseController {
  name = 'chase'
  
  defaultConfig = {
    distance: 8,
    height: 3,
    lag: 0.2,
    anticipation: 1.5
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### TopDownController

탑다운 시점 카메라 컨트롤러입니다.

```typescript
class TopDownController extends BaseController {
  name = 'topDown'
  
  defaultConfig = {
    height: 20,
    angle: -Math.PI / 2,
    followOffset: 0,
    smoothing: 0.1
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### IsometricController

아이소메트릭 시점 카메라 컨트롤러입니다.

```typescript
class IsometricController extends BaseController {
  name = 'isometric'
  
  defaultConfig = {
    distance: 15,
    angle: Math.PI / 4,
    height: 10,
    rotation: Math.PI / 4
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### SideScrollController

사이드 스크롤 카메라 컨트롤러입니다.

```typescript
class SideScrollController extends BaseController {
  name = 'sideScroll'
  
  defaultConfig = {
    distance: 12,
    height: 0,
    axis: 'z', // 스크롤 축
    leadDistance: 3
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

### FixedController

고정 카메라 컨트롤러입니다.

```typescript
class FixedController extends BaseController {
  name = 'fixed'
  
  defaultConfig = {
    position: new THREE.Vector3(0, 10, 10),
    lookAt: new THREE.Vector3(0, 0, 0)
  }
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3
}
```

## Hook APIs

### useCameraBridge

카메라 시스템과 연동하는 제네릭 훅입니다.

```typescript
function useCameraBridge<T extends BaseCameraSystem>(
  SystemClass: new (config: CameraSystemConfig) => T,
  initialConfig: CameraSystemConfig,
  eventHandlers?: Partial<{
    [K in keyof CameraSystemEvents]: (data: CameraSystemEvents[K]) => void
  }>
): {
  system: T
  updateConfig: (config: Partial<CameraSystemConfig>) => void
  getState: () => any
  getMetrics: () => any
}
```

**사용 예제**:
```typescript
function CameraComponent() {
  const { system, updateConfig, getState } = useCameraBridge(
    CameraSystem,
    {
      activeController: 'thirdPerson',
      smoothing: 0.1,
      distance: 10
    },
    {
      controllerChanged: (data) => {
        console.log('Controller changed to:', data.controllerName)
      },
      positionUpdated: (data) => {
        console.log('Camera position updated:', data.position)
      }
    }
  )
  
  const handleControllerChange = (controllerName: string) => {
    system.setActiveController(controllerName)
  }
  
  const handleDistanceChange = (distance: number) => {
    updateConfig({ distance })
  }
  
  return (
    <div>
      <button onClick={() => handleControllerChange('thirdPerson')}>
        Third Person
      </button>
      <button onClick={() => handleControllerChange('firstPerson')}>
        First Person
      </button>
      <input 
        type="range" 
        min="5" 
        max="20" 
        onChange={(e) => handleDistanceChange(Number(e.target.value))}
      />
    </div>
  )
}
```

## 컴포넌트 APIs

### Camera

메인 카메라 컴포넌트입니다.

```typescript
function Camera(props: CameraProps): JSX.Element

interface CameraProps {
  mode?: CameraType
  config?: Partial<CameraSystemConfig>
  onConfigChange?: (config: CameraSystemConfig) => void
}
```

### CameraController

카메라 컨트롤러 UI 컴포넌트입니다.

```typescript
function CameraController(): JSX.Element
```

**기능**:
- 사용 가능한 카메라 모드 표시
- 클릭으로 카메라 모드 전환
- 현재 활성 모드 표시

### CameraPresets

미리 정의된 카메라 설정을 관리하는 컴포넌트입니다.

```typescript
function CameraPresets(): JSX.Element
```

**기능**:
- 저장된 카메라 프리셋 목록
- 프리셋 적용 및 저장
- 커스텀 프리셋 생성

### CameraDebugPanel

카메라 상태를 시각화하는 디버그 패널입니다.

```typescript
function CameraDebugPanel(): JSX.Element
```

**기능**:
- 현재 카메라 위치 및 회전
- 활성 컨트롤러 정보
- 실시간 설정 값 조정
- 성능 메트릭스 표시

## 타입 정의

### CameraType

지원되는 카메라 타입입니다.

```typescript
type CameraType = 
  | 'thirdPerson' 
  | 'firstPerson' 
  | 'chase' 
  | 'topDown' 
  | 'isometric' 
  | 'side' 
  | 'fixed'
```

### CameraSystemConfig

카메라 시스템 설정입니다.

```typescript
interface CameraSystemConfig {
  // 기본 설정
  activeController: string
  smoothing: number
  
  // 3인칭/추적 카메라
  distance?: number
  height?: number
  angle?: number
  
  // 1인칭 카메라
  bobbing?: boolean
  bobbingIntensity?: number
  
  // 탑다운/아이소메트릭
  rotation?: number
  
  // 고급 설정
  collisionChecks?: boolean
  anticipation?: number
  lag?: number
  leadDistance?: number
  
  // 성능 설정
  updateFrequency?: number
  enableLOD?: boolean
}
```

### CameraCalcProps

카메라 계산에 필요한 속성들입니다.

```typescript
interface CameraCalcProps {
  activeState: ActiveStateType
  input: {
    keyboard: KeyboardState
    mouse: MouseState
  }
  deltaTime: number
  screenSize: { width: number; height: number }
}
```

### CameraState

개별 카메라 상태입니다.

```typescript
interface CameraState {
  name: string
  position: THREE.Vector3
  lookAt: THREE.Vector3
  up: THREE.Vector3
  fov: number
  near: number
  far: number
  lastUpdate: number
}
```

### CameraTransition

카메라 전환 정의입니다.

```typescript
interface CameraTransition {
  from: string
  to: string
  duration: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  properties: string[] // 전환할 속성들
}
```

## 팩토리 시스템

### CameraControllerFactory

카메라 컨트롤러 생성을 관리하는 팩토리입니다.

```typescript
class CameraControllerFactory {
  // 컨트롤러 생성
  static create(type: CameraControllerType): ICameraController
  
  // 컨트롤러 등록
  static register(type: CameraControllerType, factory: ControllerFactory): void
  
  // 사용 가능한 타입 조회
  static getAvailableTypes(): CameraControllerType[]
  static hasType(type: CameraControllerType): boolean
}
```

**사용 예제**:
```typescript
// 커스텀 컨트롤러 등록
CameraControllerFactory.register('cinematic', () => new CinematicController())

// 컨트롤러 생성
const controller = CameraControllerFactory.create('thirdPerson')
```

## 고급 사용법

### 커스텀 카메라 컨트롤러 생성

```typescript
class CinematicController extends BaseController {
  name = 'cinematic'
  
  defaultConfig = {
    waypoints: [],
    duration: 10,
    easing: 'easeInOut',
    lookAtTarget: true
  }
  
  private currentWaypoint = 0
  private startTime = 0
  
  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const { waypoints, duration, easing } = this.config
    
    if (!waypoints || waypoints.length === 0) {
      return props.activeState.position
    }
    
    // 시간 기반 웨이포인트 보간
    const progress = Math.min((Date.now() - this.startTime) / (duration * 1000), 1)
    const easedProgress = this.applyEasing(progress, easing)
    
    return this.interpolateWaypoints(waypoints, easedProgress)
  }
  
  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'easeIn': return t * t
      case 'easeOut': return t * (2 - t)
      case 'easeInOut': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      default: return t
    }
  }
  
  private interpolateWaypoints(waypoints: THREE.Vector3[], t: number): THREE.Vector3 {
    const segmentCount = waypoints.length - 1
    const segment = Math.floor(t * segmentCount)
    const localT = (t * segmentCount) - segment
    
    const start = waypoints[Math.min(segment, waypoints.length - 1)]
    const end = waypoints[Math.min(segment + 1, waypoints.length - 1)]
    
    return start.clone().lerp(end, localT)
  }
}
```

### 동적 카메라 전환

```typescript
function useDynamicCameraTransition() {
  const { system } = useCameraBridge(CameraSystem, defaultConfig)
  
  const transitionToController = useCallback((
    targetController: string,
    duration: number = 1,
    easing: string = 'easeInOut'
  ) => {
    const currentState = system.getState()
    const currentPosition = currentState.camera.position.clone()
    const currentLookAt = currentState.camera.lookAt.clone()
    
    // 목표 컨트롤러로 전환
    system.setActiveController(targetController)
    
    // 전환 애니메이션
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const easedProgress = applyEasing(progress, easing)
      
      if (progress < 1) {
        // 부드러운 전환 로직
        const newState = system.getState()
        const targetPosition = newState.camera.position
        const targetLookAt = newState.camera.lookAt
        
        const interpolatedPosition = currentPosition.clone().lerp(targetPosition, easedProgress)
        const interpolatedLookAt = currentLookAt.clone().lerp(targetLookAt, easedProgress)
        
        system.setCameraState('transition', {
          name: 'transition',
          position: interpolatedPosition,
          lookAt: interpolatedLookAt,
          up: new THREE.Vector3(0, 1, 0),
          fov: 75,
          near: 0.1,
          far: 1000,
          lastUpdate: Date.now()
        })
        
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [system])
  
  return { transitionToController }
}
```

### 카메라 충돌 감지

```typescript
function useCameraCollision() {
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  
  const checkCollision = useCallback((
    cameraPosition: THREE.Vector3,
    targetPosition: THREE.Vector3,
    obstacles: THREE.Object3D[]
  ): { 
    hasCollision: boolean
    adjustedPosition: THREE.Vector3
  } => {
    const direction = cameraPosition.clone().sub(targetPosition).normalize()
    const distance = cameraPosition.distanceTo(targetPosition)
    
    raycaster.set(targetPosition, direction)
    const intersections = raycaster.intersectObjects(obstacles, true)
    
    if (intersections.length > 0 && intersections[0].distance < distance) {
      // 충돌 지점에서 약간 앞으로 카메라 위치 조정
      const collisionPoint = intersections[0].point
      const adjustedPosition = collisionPoint.clone().add(
        direction.clone().multiplyScalar(-0.5)
      )
      
      return {
        hasCollision: true,
        adjustedPosition
      }
    }
    
    return {
      hasCollision: false,
      adjustedPosition: cameraPosition
    }
  }, [raycaster])
  
  return { checkCollision }
}
```

### 카메라 셰이크 효과

```typescript
function useCameraShake() {
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const [shakeDuration, setShakeDuration] = useState(0)
  const shakeStartTime = useRef(0)
  
  const startShake = useCallback((intensity: number, duration: number) => {
    setShakeIntensity(intensity)
    setShakeDuration(duration)
    shakeStartTime.current = Date.now()
  }, [])
  
  const getShakeOffset = useCallback((): THREE.Vector3 => {
    if (shakeDuration <= 0) return new THREE.Vector3()
    
    const elapsed = Date.now() - shakeStartTime.current
    const progress = elapsed / (shakeDuration * 1000)
    
    if (progress >= 1) {
      setShakeIntensity(0)
      setShakeDuration(0)
      return new THREE.Vector3()
    }
    
    // 감쇠하는 랜덤 셰이크
    const currentIntensity = shakeIntensity * (1 - progress)
    const offsetX = (Math.random() - 0.5) * currentIntensity
    const offsetY = (Math.random() - 0.5) * currentIntensity
    const offsetZ = (Math.random() - 0.5) * currentIntensity
    
    return new THREE.Vector3(offsetX, offsetY, offsetZ)
  }, [shakeIntensity, shakeDuration])
  
  return { startShake, getShakeOffset }
}
```

### 카메라 프리셋 관리

```typescript
function useCameraPresets() {
  const [presets, setPresets] = useState<Record<string, CameraPreset>>({
    'action': {
      controller: 'thirdPerson',
      config: { distance: 8, height: 4, smoothing: 0.2 }
    },
    'exploration': {
      controller: 'thirdPerson',
      config: { distance: 12, height: 6, smoothing: 0.1 }
    },
    'cinematic': {
      controller: 'chase',
      config: { distance: 15, height: 8, lag: 0.3 }
    }
  })
  
  const savePreset = useCallback((name: string, controller: string, config: any) => {
    setPresets(prev => ({
      ...prev,
      [name]: { controller, config }
    }))
    
    // 로컬 스토리지에 저장
    localStorage.setItem('cameraPresets', JSON.stringify(presets))
  }, [presets])
  
  const loadPreset = useCallback((name: string): CameraPreset | null => {
    return presets[name] || null
  }, [presets])
  
  const applyPreset = useCallback((name: string, cameraSystem: CameraSystem) => {
    const preset = loadPreset(name)
    if (preset) {
      cameraSystem.setActiveController(preset.controller)
      cameraSystem.updateConfig(preset.config)
    }
  }, [loadPreset])
  
  // 초기 로드
  useEffect(() => {
    const savedPresets = localStorage.getItem('cameraPresets')
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets))
    }
  }, [])
  
  return {
    presets,
    savePreset,
    loadPreset,
    applyPreset
  }
}

interface CameraPreset {
  controller: string
  config: any
}
```

## 성능 최적화

### 1. 카메라 업데이트 최적화

```typescript
function useOptimizedCamera(importance: 'high' | 'medium' | 'low') {
  const updateFrequency = useMemo(() => {
    switch (importance) {
      case 'high': return 60 // 60fps
      case 'medium': return 30 // 30fps  
      case 'low': return 15 // 15fps
      default: return 60
    }
  }, [importance])
  
  return useCameraBridge(CameraSystem, {
    updateFrequency,
    enableLOD: importance !== 'high'
  })
}
```

### 2. 거리 기반 LOD

```typescript
function useCameraLOD(distance: number) {
  const lodConfig = useMemo(() => {
    if (distance > 100) {
      return {
        updateFrequency: 10,
        smoothing: 0.3,
        collisionChecks: false
      }
    } else if (distance > 50) {
      return {
        updateFrequency: 20,
        smoothing: 0.2,
        collisionChecks: true
      }
    } else {
      return {
        updateFrequency: 60,
        smoothing: 0.1,
        collisionChecks: true
      }
    }
  }, [distance])
  
  return lodConfig
}
```

## 디버깅 도구

### 카메라 상태 시각화

```typescript
function CameraDebugOverlay() {
  const [cameraState, setCameraState] = useState<any>()
  const { system } = useCameraBridge(CameraSystem, defaultConfig)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCameraState(system.getState())
    }, 100)
    
    return () => clearInterval(interval)
  }, [system])
  
  if (!cameraState) return null
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: 10,
      fontFamily: 'monospace'
    }}>
      <h3>Camera Debug</h3>
      <div>Controller: {cameraState.activeController}</div>
      <div>Position: {cameraState.camera.position.toArray().map(n => n.toFixed(2)).join(', ')}</div>
      <div>LookAt: {cameraState.camera.lookAt.toArray().map(n => n.toFixed(2)).join(', ')}</div>
      <div>Distance: {cameraState.config.distance}</div>
      <div>Height: {cameraState.config.height}</div>
      <div>Smoothing: {cameraState.config.smoothing}</div>
    </div>
  )
}
```

이 API 가이드는 Camera Domain의 모든 기능을 상세히 다루며, 기본 카메라 조작부터 복잡한 시네마틱 카메라 시스템까지 완전한 카메라 제어 시스템을 구축할 수 있는 레퍼런스를 제공합니다. 