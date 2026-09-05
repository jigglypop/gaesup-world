import * as THREE from 'three' 

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  shift: boolean;
  space: boolean;
  keyZ: boolean;
  keyR: boolean;
  keyF: boolean;
  keyE: boolean;
  escape: boolean;
}

export interface MouseState {
  target: THREE.Vector3;
  angle: number;
  isActive: boolean;
  /** Set when movement reaches its target. moveTo clears this before starting. */
  hasArrived?: boolean;
  shouldRun: boolean;
  isLookAround?: boolean;
  buttons: {
    left: boolean;
    right: boolean;
    middle: boolean;
  };
  wheel: number;
  position: THREE.Vector2;
}

export interface GamepadState {
  connected: boolean;
  leftStick: THREE.Vector2;
  rightStick: THREE.Vector2;
  triggers: { left: number; right: number };
  buttons: Record<string, boolean>;
  vibration: { weak: number; strong: number };
}

export interface TouchState {
  touches: Array<{
    id: number;
    position: THREE.Vector2;
    force: number;
  }>;
  gestures: {
    pinch: number;
    rotation: number;
    pan: THREE.Vector2;
  };
}

export interface InteractionState {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad: GamepadState;
  touch: TouchState;
  lastUpdate: number;
  isActive: boolean;
}

export interface InteractionConfig {
  sensitivity: {
    mouse: number;
    gamepad: number;
    touch: number;
  };
  deadzone: {
    gamepad: number;
    touch: number;
  };
  smoothing: {
    mouse: number;
    gamepad: number;
  };
  invertY: boolean;
  enableVibration: boolean;
}

export interface InteractionMetrics {
  lastUpdate: number;
  inputLatency: number;
  frameTime: number;
  eventCount: number;
  activeInputs: string[];
  performanceScore: number;
}


export interface AutomationAction {
  id: string;
  type: 'move' | 'click' | 'wait' | 'key' | 'custom';
  target?: THREE.Vector3;
  key?: string;
  duration?: number;
  delay?: number;
  beforeCallback?: () => void;
  afterCallback?: () => void;
  data?: Record<string, object | string | number | boolean | null | undefined>;
  timestamp?: number;
}

type AutomationQueue = {
  actions: AutomationAction[];
  currentIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  loop: boolean;
  maxRetries: number;
}

export interface AutomationSettings {
  throttle: number;
  autoStart: boolean;
  trackProgress: boolean;
  showVisualCues: boolean;
}

export interface AutomationState {
  isActive: boolean;
  queue: AutomationQueue;
  currentAction: AutomationAction | null;
  executionStats: {
    totalExecuted: number;
    successRate: number;
    averageTime: number;
    errors: string[];
  };
  settings: AutomationSettings;
}

export interface AutomationConfig {
  maxConcurrentActions: number;
  defaultDelay: number;
  retryDelay: number;
  timeoutDuration: number;
  enableLogging: boolean;
  visualCues: {
    showPath: boolean;
    showTargets: boolean;
    lineColor: string;
    targetColor: string;
  };
}

export interface AutomationMetrics {
  queueLength: number;
  executionTime: number;
  performance: number;
  memoryUsage: number;
  errorRate: number;
}
