# Interactions Domain API Reference

## 개요

Interactions Domain은 **키보드, 마우스, 게임패드, 터치 입력 처리 및 자동화 시스템**을 제공합니다. 실시간 입력 이벤트를 처리하고, 자동화된 입력 시퀀스를 지원하며, 다양한 입력 장치를 통합 관리합니다.

**경로**: `src/core/interactions/`

## 핵심 시스템

### InteractionSystem

모든 입력 장치를 통합 관리하는 싱글톤 시스템입니다.

```typescript
@RegisterSystem('interaction')
@ManageRuntime({ autoStart: true })
class InteractionSystem extends AbstractSystem<
  InteractionSystemState, 
  InteractionSystemMetrics
> {
  static getInstance(): InteractionSystem
  
  // 상태 관리
  getState(): InteractionSystemState
  getKeyboardRef(): KeyboardState
  getMouseRef(): MouseState
  getGamepadRef(): GamepadState
  getTouchRef(): TouchState
  
  // 입력 업데이트
  updateKeyboard(updates: Partial<KeyboardState>): void
  updateMouse(updates: Partial<MouseState>): void
  updateGamepad(updates: Partial<GamepadState>): void
  updateTouch(updates: Partial<TouchState>): void
  
  // 설정 관리
  getConfig(): InteractionConfig
  setConfig(config: Partial<InteractionConfig>): void
  
  // 메트릭스
  getMetrics(): InteractionSystemMetrics
  
  // 초기화 및 정리
  reset(): void
  dispose(): void
}
```

### InteractionBridge

Interaction 시스템과 React 컴포넌트 간의 브릿지입니다.

```typescript
class InteractionBridge {
  constructor()
  
  // 명령 실행
  executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void
  
  // 상태 조회
  snapshot(): InteractionSnapshot
  getKeyboardState(): KeyboardState
  getMouseState(): MouseState
  
  // 구독 시스템
  subscribe(listener: (state: { keyboard: KeyboardState; mouse: MouseState }) => void): () => void
  
  // 시스템 접근
  getInteractionSystem(): InteractionSystem
  getAutomationSystem(): AutomationSystem
  
  // 초기화 및 정리
  reset(): void
  dispose(): void
}
```

### AutomationSystem

자동화된 입력 시퀀스를 관리하는 시스템입니다.

```typescript
class AutomationSystem {
  constructor()
  
  // 액션 관리
  addAction(action: AutomationAction): void
  removeAction(id: string): void
  clearQueue(): void
  
  // 실행 제어
  start(): void
  pause(): void
  resume(): void
  stop(): void
  
  // 이벤트 리스너
  addEventListener(event: string, listener: Function): void
  removeEventListener(event: string, listener: Function): void
  
  // 설정 및 상태
  updateSettings(settings: Partial<AutomationSettings>): void
  getMetrics(): AutomationMetrics
  
  // 정리
  reset(): void
  dispose(): void
}
```

## Hook APIs

### useInteractionSystem

**메인 Interaction 훅** - 글로벌 인터랙션 시스템과 연동합니다.

```typescript
function useInteractionSystem(): UseInteractionSystemResult

interface UseInteractionSystemResult {
  keyboard: KeyboardState
  mouse: MouseState
  updateKeyboard: (updates: Partial<KeyboardState>) => void
  updateMouse: (updates: Partial<MouseState>) => void
  dispatchInput: (updates: Partial<MouseState>) => void
}
```

**사용 예제**:
```typescript
function MyComponent() {
  const { keyboard, mouse, updateKeyboard, updateMouse } = useInteractionSystem()
  
  const handleJump = () => {
    updateKeyboard({ space: true })
    setTimeout(() => updateKeyboard({ space: false }), 100)
  }
  
  const handleClick = (position: THREE.Vector3) => {
    updateMouse({ 
      target: position,
      isActive: true,
      buttons: { left: true }
    })
  }
  
  return (
    <div>
      <div>WASD: {keyboard.forward ? 'W' : ''}{keyboard.leftward ? 'A' : ''}{keyboard.backward ? 'S' : ''}{keyboard.rightward ? 'D' : ''}</div>
      <div>Mouse: {mouse.isActive ? `(${mouse.target.x}, ${mouse.target.y}, ${mouse.target.z})` : 'Inactive'}</div>
      <button onClick={handleJump}>Jump</button>
    </div>
  )
}
```

### useKeyboard

키보드 입력을 자동으로 처리하는 훅입니다.

```typescript
function useKeyboard(
  enableDiagonal?: boolean,
  enableClicker?: boolean, 
  cameraOption?: unknown
): void
```

**특징**:
- 자동 키 매핑 (`WASD`, `Space`, `Shift` 등)
- 대각선 이동 지원
- 자동화 시스템과 연동
- 페이지 숨김 시 자동 초기화

**키 매핑**:
```typescript
const KEY_MAPPING = {
  KeyW: 'forward',
  KeyA: 'leftward', 
  KeyS: 'backward',
  KeyD: 'rightward',
  ShiftLeft: 'shift',
  Space: 'space',
  KeyZ: 'keyZ',
  KeyR: 'keyR',
  KeyF: 'keyF',
  KeyE: 'keyE',
  Escape: 'escape'
}
```

## 상태 타입 정의

### KeyboardState

```typescript
interface KeyboardState {
  forward: boolean      // W key
  backward: boolean     // S key  
  leftward: boolean     // A key
  rightward: boolean    // D key
  shift: boolean        // Shift key (run)
  space: boolean        // Space key (jump)
  keyZ: boolean         // Z key
  keyR: boolean         // R key  
  keyF: boolean         // F key (interact)
  keyE: boolean         // E key
  escape: boolean       // Escape key
}
```

### MouseState

```typescript
interface MouseState {
  target: THREE.Vector3       // 목표 위치
  angle: number              // 회전 각도
  isActive: boolean          // 활성 상태
  shouldRun: boolean         // 달리기 모드
  buttons: {                 // 마우스 버튼 상태
    left: boolean
    right: boolean  
    middle: boolean
  }
  wheel: number              // 휠 값
  position: THREE.Vector2    // 화면 위치
}
```

### GamepadState

```typescript
interface GamepadState {
  connected: boolean
  leftStick: THREE.Vector2   // 왼쪽 스틱
  rightStick: THREE.Vector2  // 오른쪽 스틱
  triggers: {
    left: number             // 왼쪽 트리거 (0-1)
    right: number            // 오른쪽 트리거 (0-1)
  }
  buttons: Record<string, boolean>  // 버튼 상태
  vibration: {
    weak: number             // 약한 진동
    strong: number           // 강한 진동
  }
}
```

### TouchState

```typescript
interface TouchState {
  touches: TouchPoint[]      // 터치 포인트 배열
  gestures: {
    pinch: number            // 핀치 스케일
    rotation: number         // 회전 각도
    pan: THREE.Vector2       // 팬 이동
  }
}

interface TouchPoint {
  id: number
  position: THREE.Vector2
  pressure: number
  radius: number
}
```

## Command 시스템

### BridgeCommand

브릿지로 전송되는 명령의 기본 구조입니다.

```typescript
interface BridgeCommand {
  type: 'input' | 'automation'
  action: string
  data?: unknown
  timestamp?: number
}
```

### Input Commands

**키보드 업데이트**:
```typescript
{
  type: 'input',
  action: 'updateKeyboard',
  data: { forward: true, shift: true }
}
```

**마우스 업데이트**:
```typescript
{
  type: 'input', 
  action: 'updateMouse',
  data: { 
    target: new THREE.Vector3(10, 0, 10),
    isActive: true 
  }
}
```

**게임패드 업데이트**:
```typescript
{
  type: 'input',
  action: 'updateGamepad', 
  data: { 
    leftStick: new THREE.Vector2(0.5, 0.8),
    buttons: { A: true }
  }
}
```

**설정 변경**:
```typescript
{
  type: 'input',
  action: 'setConfig',
  data: { 
    mouseSensitivity: 0.5,
    keyRepeatDelay: 100
  }
}
```

### Automation Commands

**액션 추가**:
```typescript
{
  type: 'automation',
  action: 'addAction',
  data: {
    id: 'move-sequence-1',
    type: 'move',
    target: new THREE.Vector3(10, 0, 10),
    duration: 2000
  }
}
```

**자동화 시작/정지**:
```typescript
{
  type: 'automation',
  action: 'start'  // 또는 'pause', 'resume', 'stop'
}
```

## 자동화 시스템

### AutomationAction 타입

```typescript
interface AutomationAction {
  id: string
  type: 'move' | 'click' | 'key' | 'wait' | 'sequence'
  target?: THREE.Vector3
  key?: string
  duration?: number
  delay?: number
  repeat?: number
  children?: AutomationAction[]  // sequence 타입용
}
```

### 자동화 사용 예제

```typescript
function useAutomatedMovement() {
  const { updateMouse } = useInteractionSystem()
  
  const startPatrol = useCallback(() => {
    const bridge = getGlobalBridge()
    
    // 순찰 경로 정의
    const waypoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 0), 
      new THREE.Vector3(10, 0, 10),
      new THREE.Vector3(0, 0, 10)
    ]
    
    waypoints.forEach((point, index) => {
      bridge.executeCommand({
        type: 'automation',
        action: 'addAction',
        data: {
          id: `patrol-${index}`,
          type: 'move',
          target: point,
          duration: 3000
        }
      })
    })
    
    bridge.executeCommand({
      type: 'automation', 
      action: 'start'
    })
  }, [])
  
  return { startPatrol }
}
```

## 이벤트 시스템

### InteractionBridge 이벤트

```typescript
interface BridgeEvent {
  type: 'input' | 'automation' | 'sync'
  event: string
  data?: unknown
  timestamp: number
}
```

**이벤트 구독**:
```typescript
function useInteractionEvents() {
  useEffect(() => {
    const bridge = getGlobalBridge()
    
    const unsubscribe = bridge.subscribe((state) => {
      console.log('Input state changed:', state)
    })
    
    return unsubscribe
  }, [])
}
```

**커스텀 이벤트 처리**:
```typescript
bridge.addEventListener('moveRequested', (target: THREE.Vector3) => {
  console.log('Move requested to:', target)
})

bridge.addEventListener('keyRequested', (key: string) => {
  console.log('Key requested:', key)
})
```

## 설정 시스템

### InteractionConfig

```typescript
interface InteractionConfig {
  mouseSensitivity: number        // 마우스 감도
  keyRepeatDelay: number         // 키 반복 지연
  gamepadDeadzone: number        // 게임패드 데드존
  touchSensitivity: number       // 터치 감도
  automationEnabled: boolean     // 자동화 활성화
  debugMode: boolean            // 디버그 모드
}
```

**설정 사용 예제**:
```typescript
function useInteractionConfig() {
  const [config, setConfig] = useState<InteractionConfig>()
  
  useEffect(() => {
    const system = InteractionSystem.getInstance()
    setConfig(system.getConfig())
  }, [])
  
  const updateConfig = useCallback((updates: Partial<InteractionConfig>) => {
    const system = InteractionSystem.getInstance()
    system.setConfig(updates)
    setConfig(system.getConfig())
  }, [])
  
  return { config, updateConfig }
}
```

## 메트릭스 시스템

### InteractionSystemMetrics

```typescript
interface InteractionSystemMetrics {
  inputLatency: number          // 입력 지연시간
  frameTime: number            // 프레임 시간
  eventCount: number           // 이벤트 수
  activeInputs: string[]       // 활성 입력들
  performanceScore: number     // 성능 점수
  lastUpdate: number          // 마지막 업데이트 시간
}
```

### AutomationMetrics

```typescript
interface AutomationMetrics {
  queueLength: number         // 큐 길이
  executedActions: number     // 실행된 액션 수
  averageExecutionTime: number // 평균 실행 시간
  errorCount: number          // 에러 수
  isRunning: boolean         // 실행 중 여부
}
```

**메트릭스 사용 예제**:
```typescript
function useInteractionMetrics() {
  const [metrics, setMetrics] = useState<InteractionSystemMetrics>()
  
  useEffect(() => {
    const interval = setInterval(() => {
      const system = InteractionSystem.getInstance()
      setMetrics(system.getMetrics())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return metrics
}
```

## 고급 사용법

### 커스텀 입력 매핑

```typescript
function useCustomKeyMapping() {
  const { updateKeyboard } = useInteractionSystem()
  
  useEffect(() => {
    const customKeyMap = {
      KeyQ: 'customAction1',
      KeyT: 'customAction2'
    }
    
    const handleKeyEvent = (e: KeyboardEvent, isDown: boolean) => {
      const action = customKeyMap[e.code as keyof typeof customKeyMap]
      if (action) {
        updateKeyboard({ [action]: isDown } as any)
      }
    }
    
    const keyDown = (e: KeyboardEvent) => handleKeyEvent(e, true)
    const keyUp = (e: KeyboardEvent) => handleKeyEvent(e, false)
    
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }, [updateKeyboard])
}
```

### 복합 입력 처리

```typescript
function useComboInputs() {
  const { keyboard, mouse, updateKeyboard } = useInteractionSystem()
  
  useEffect(() => {
    // Ctrl + Space 조합
    if (keyboard.keyCtrl && keyboard.space) {
      console.log('Super jump activated!')
      updateKeyboard({ space: false }) // 중복 실행 방지
    }
    
    // Shift + 클릭 조합
    if (keyboard.shift && mouse.buttons.left) {
      console.log('Force move activated!')
    }
  }, [keyboard, mouse, updateKeyboard])
}
```

### 입력 시퀀스 감지

```typescript
function useInputSequence() {
  const { keyboard } = useInteractionSystem()
  const [sequence, setSequence] = useState<string[]>([])
  
  useEffect(() => {
    const activeKeys = Object.entries(keyboard)
      .filter(([_, pressed]) => pressed)
      .map(([key, _]) => key)
    
    if (activeKeys.length > 0) {
      setSequence(prev => [...prev, ...activeKeys].slice(-10)) // 최근 10개만 유지
    }
    
    // 콤보 감지
    const sequenceString = sequence.join('-')
    if (sequenceString.includes('forward-forward-space')) {
      console.log('Double dash combo detected!')
      setSequence([]) // 시퀀스 초기화
    }
  }, [keyboard, sequence])
}
```

### 게임패드 진동 제어

```typescript
function useGamepadVibration() {
  const bridge = useMemo(() => getGlobalBridge(), [])
  
  const vibrate = useCallback((weak: number, strong: number, duration: number) => {
    bridge.executeCommand({
      type: 'input',
      action: 'updateGamepad',
      data: {
        vibration: { weak, strong }
      }
    })
    
    setTimeout(() => {
      bridge.executeCommand({
        type: 'input',
        action: 'updateGamepad', 
        data: {
          vibration: { weak: 0, strong: 0 }
        }
      })
    }, duration)
  }, [bridge])
  
  return { vibrate }
}
```

## 디버깅 및 개발 도구

### 입력 상태 시각화

```typescript
function InputDebugPanel() {
  const { keyboard, mouse } = useInteractionSystem()
  const metrics = useInteractionMetrics()
  
  return (
    <div style={{ position: 'fixed', top: 10, right: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: 10 }}>
      <h3>Input Debug</h3>
      
      <div>
        <h4>Keyboard</h4>
        {Object.entries(keyboard).map(([key, pressed]) => (
          <div key={key} style={{ color: pressed ? 'lime' : 'gray' }}>
            {key}: {pressed ? 'ON' : 'OFF'}
          </div>
        ))}
      </div>
      
      <div>
        <h4>Mouse</h4>
        <div>Position: ({mouse.position.x.toFixed(1)}, {mouse.position.y.toFixed(1)})</div>
        <div>Target: ({mouse.target.x.toFixed(1)}, {mouse.target.y.toFixed(1)}, {mouse.target.z.toFixed(1)})</div>
        <div>Active: {mouse.isActive ? 'YES' : 'NO'}</div>
      </div>
      
      {metrics && (
        <div>
          <h4>Metrics</h4>
          <div>Input Latency: {metrics.inputLatency}ms</div>
          <div>Frame Time: {metrics.frameTime}ms</div>
          <div>Performance: {metrics.performanceScore}</div>
        </div>
      )}
    </div>
  )
}
```

### 자동화 시퀀스 디버거

```typescript
function AutomationDebugPanel() {
  const [automationState, setAutomationState] = useState<any>()
  
  useEffect(() => {
    const bridge = getGlobalBridge()
    const system = bridge.getAutomationSystem()
    
    const interval = setInterval(() => {
      setAutomationState({
        metrics: system.getMetrics(),
        isRunning: system.getMetrics().isRunning
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div>
      <h3>Automation Debug</h3>
      {automationState && (
        <div>
          <div>Queue Length: {automationState.metrics.queueLength}</div>
          <div>Executed Actions: {automationState.metrics.executedActions}</div>
          <div>Running: {automationState.isRunning ? 'YES' : 'NO'}</div>
          <div>Errors: {automationState.metrics.errorCount}</div>
        </div>
      )}
    </div>
  )
}
```

## 성능 최적화

### 1. 입력 이벤트 스로틀링

```typescript
// InteractionBridge 내부에서 자동으로 16ms 간격으로 동기화
// 추가 스로틀링이 필요한 경우:
const throttledUpdate = useMemo(() => 
  throttle((updates: Partial<KeyboardState>) => {
    updateKeyboard(updates)
  }, 50), // 20fps로 제한
[updateKeyboard])
```

### 2. 메모리 효율적인 이벤트 처리

```typescript
function useOptimizedInput() {
  const eventCallbacksRef = useRef(new Map())
  
  const addEventCallback = useCallback((event: string, callback: Function) => {
    if (!eventCallbacksRef.current.has(event)) {
      eventCallbacksRef.current.set(event, new Set())
    }
    eventCallbacksRef.current.get(event).add(callback)
  }, [])
  
  const removeEventCallback = useCallback((event: string, callback: Function) => {
    eventCallbacksRef.current.get(event)?.delete(callback)
  }, [])
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      eventCallbacksRef.current.clear()
    }
  }, [])
}
```

이 API 가이드는 Interactions Domain의 모든 기능을 포괄하며, 다양한 입력 장치와 자동화 시스템을 효과적으로 활용할 수 있는 완전한 레퍼런스를 제공합니다. 