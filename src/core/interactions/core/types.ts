import * as THREE from 'three' 

export type KeyboardState = {
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

export type MouseState = {
  target: THREE.Vector3;
  angle: number;
  isActive: boolean;
  shouldRun: boolean;
  buttons: {
    left: boolean;
    right: boolean;
    middle: boolean;
  };
  wheel: number;
  position: THREE.Vector2;
}

export type GamepadState = {
  connected: boolean;
  leftStick: THREE.Vector2;
  rightStick: THREE.Vector2;
  triggers: { left: number; right: number };
  buttons: Record<string, boolean>;
  vibration: { weak: number; strong: number };
}

export type TouchState = {
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

export type InteractionState = {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad: GamepadState;
  touch: TouchState;
  lastUpdate: number;
  isActive: boolean;
}

export type InteractionConfig = {
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

export type InteractionMetrics = {
  inputLatency: number;
  frameTime: number;
  eventCount: number;
  activeInputs: string[];
  performanceScore: number;
}


export type AutomationAction = {
  id: string;
  type: 'move' | 'click' | 'wait' | 'key' | 'custom';
  target?: THREE.Vector3;
  key?: string;
  duration?: number;
  delay?: number;
  beforeCallback?: () => void;
  afterCallback?: () => void;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export type AutomationQueue = {
  actions: AutomationAction[];
  currentIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  loop: boolean;
  maxRetries: number;
}

export type AutomationState = {
  isActive: boolean;
  queue: AutomationQueue;
  currentAction: AutomationAction | null;
  executionStats: {
    totalExecuted: number;
    successRate: number;
    averageTime: number;
    errors: string[];
  };
  settings: {
    throttle: number;
    autoStart: boolean;
    trackProgress: boolean;
    showVisualCues: boolean;
  };
}

export type AutomationConfig = {
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

export type AutomationMetrics = {
  queueLength: number;
  executionTime: number;
  performance: number;
  memoryUsage: number;
  errorRate: number;
}
