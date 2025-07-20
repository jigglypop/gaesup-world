# Interactions Domain Config Classification

## Store Config (유저 설정값)

초기 설정 또는 유저가 설정 페이지에서 변경하는 값들입니다.

```typescript
type InteractionsConfig = {
  mouseSensitivity: number
  keyRepeatDelay: number
  gamepadDeadzone: number
  touchSensitivity: number
  automationEnabled: boolean
  debugMode: boolean
  keyBindings: Record<string, string>
  invertMouseY: boolean
  gamepadEnabled: boolean
  doubleClickThreshold: number
  dragThreshold: number
  hapticFeedbackEnabled: boolean
}
```

**언제 변경되는가:**
- 유저가 Input Settings에서 조정
- 게임 시작 시 초기 설정
- 접근성 설정 변경 시
- 디바이스 변경 시 자동 조정

**데이터 플로우:**
```
Input Settings UI → Store → Bridge → Core InputSystem (1회성 전달)
```

## Constants (절대 불변값)

입력 처리에서 절대 변하지 않는 상수들입니다.

```typescript
export const INPUT_CONSTANTS = {
  MAX_MOUSE_SENSITIVITY: 10.0,
  MIN_MOUSE_SENSITIVITY: 0.1,
  MAX_GAMEPAD_DEADZONE: 0.9,
  MIN_GAMEPAD_DEADZONE: 0.0,
  INPUT_BUFFER_SIZE: 10,
  MAX_TOUCH_POINTS: 10,
  GESTURE_MIN_DISTANCE: 20,
  AUTOMATION_MAX_ACTIONS: 1000,
  EVENT_THROTTLE_MS: 16,
  LONG_PRESS_DURATION: 500
} as const
```

**특징:**
- 입력 시스템 물리적 한계
- 성능 보장을 위한 임계값
- 하드웨어 제약사항

## Realtime State (매 프레임 변화)

Core Layer에서 관리하며 Store에 절대 저장하면 안 되는 값들입니다.

```typescript
type InteractionState = {
  keyboard: KeyboardState
  mouse: MouseState
  gamepad: GamepadState
  touch: TouchState
  currentInputMode: 'keyboard' | 'gamepad' | 'touch'
  inputBuffer: InputEvent[]
  lastInputTime: number
  activeGestures: GestureData[]
  automationQueue: AutomationAction[]
  inputLatency: number
  eventCount: number
  activeInputs: string[]
}

type KeyboardState = {
  forward: boolean
  backward: boolean
  leftward: boolean
  rightward: boolean
  shift: boolean
  space: boolean
  keyZ: boolean
  keyR: boolean
  keyF: boolean
  keyE: boolean
  escape: boolean
}

type MouseState = {
  target: THREE.Vector3
  angle: number
  isActive: boolean
  shouldRun: boolean
  buttons: {
    left: boolean
    right: boolean
    middle: boolean
  }
  wheel: number
  position: THREE.Vector2
  delta: THREE.Vector2
}
```

**특징:**
- 매 프레임 또는 이벤트마다 업데이트
- 하드웨어에서 직접 수신
- React 상태 관리 절대 금지
- 이벤트 리스너에서 직접 업데이트

## 잘못된 분류 예시

```typescript
// ❌ 잘못된 분류 - 이런 값들이 Store에 있으면 안됨
type WrongConfig = {
  currentMousePosition: THREE.Vector2  // 매 프레임 변화 → Realtime State
  isKeyPressed: boolean                // 이벤트 상태 → Realtime State
  gamepadConnected: boolean            // 하드웨어 상태 → Realtime State
  INPUT_EVENT_TYPES: string[]          // 절대 불변 → Constants
}
```

## 올바른 구현 패턴

### Config 변경 시 (1회성)
```typescript
// Settings에서 mouse sensitivity 변경
const updateMouseSensitivity = (sensitivity: number) => {
  interactionStore.setConfig({ mouseSensitivity: sensitivity })
}

// Hook에서 감지하여 Core로 전달
useEffect(() => {
  inputSystem.updateConfig(interactionStore.config)
}, [interactionStore.config.mouseSensitivity])

// Core에서 적용
class InputSystem {
  updateConfig(config: InteractionsConfig) {
    this.mouseSensitivity = config.mouseSensitivity
    this.rebindKeys(config.keyBindings)
  }
}
```

### 실시간 입력 처리 (이벤트 드리븐)
```typescript
// Core Layer - Store 접근 없이 기존 설정값 사용
class InputSystem {
  private handleMouseMove = (event: MouseEvent) => {
    const scaledDelta = {
      x: event.movementX * this.mouseSensitivity,
      y: event.movementY * this.mouseSensitivity
    }
    
    this.updateMouseState({
      delta: scaledDelta,
      position: { x: event.clientX, y: event.clientY }
    })
  }
  
  private handleKeyDown = (event: KeyboardEvent) => {
    const mappedKey = this.keyBindings[event.code]
    if (mappedKey) {
      this.updateKeyboardState({ [mappedKey]: true })
    }
  }
}
```

### 자동화 시스템 (큐 기반)
```typescript
// Core Layer - 자동화 액션 처리
class AutomationSystem {
  private processQueue() {
    if (!this.automationEnabled) return
    
    const action = this.actionQueue.shift()
    if (action) {
      this.executeAction(action)
    }
  }
  
  addAction(action: AutomationAction) {
    if (this.actionQueue.length < INPUT_CONSTANTS.AUTOMATION_MAX_ACTIONS) {
      this.actionQueue.push(action)
    }
  }
}
```

이 분류를 통해 입력 지연 최소화와 사용자 경험 최적화를 보장합니다. 