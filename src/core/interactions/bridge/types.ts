import * as THREE from 'three';

export interface BridgeCommand {
  type: 'input' | 'automation';
  action: string;
  data?: unknown;
  timestamp?: number;
}

export interface BridgeState {
  isActive: boolean;
  lastCommand: BridgeCommand | null;
  commandHistory: BridgeCommand[];
  syncStatus: 'idle' | 'syncing' | 'error';
}

export interface BridgeEvent {
  type: 'input' | 'automation' | 'sync';
  event: string;
  data?: unknown;
  timestamp: number;
}

export interface InputCommand {
  updateKeyboard: (data: Partial<KeyboardState>) => void;
  updateMouse: (data: Partial<MouseState>) => void;
  updateGamepad: (data: Partial<GamepadState>) => void;
  updateTouch: (data: Partial<TouchState>) => void;
  moveTo: (target: THREE.Vector3) => void;
  clickAt: (target: THREE.Vector3) => void;
  keyPress: (key: string) => void;
}

export interface AutomationCommand {
  addAction: (action: AutomationAction) => string;
  removeAction: (id: string) => boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  clearQueue: () => void;
  updateSettings: (settings: Partial<AutomationSettings>) => void;
}

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
  shouldRun: boolean;
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

export interface AutomationAction {
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

export interface AutomationSettings {
  throttle: number;
  autoStart: boolean;
  trackProgress: boolean;
  showVisualCues: boolean;
}

export interface BridgeSnapshot {
  interaction: {
    state: InteractionState;
    config: InteractionConfig;
    metrics: InteractionMetrics;
  };
  automation: {
    state: AutomationState;
    config: AutomationConfig;
    metrics: AutomationMetrics;
  };
  bridge: BridgeState;
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

export interface AutomationState {
  isActive: boolean;
  queue: {
    actions: AutomationAction[];
    currentIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    loop: boolean;
    maxRetries: number;
  };
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

export interface InteractionCommand {
  type: 'updateKeyboard' | 'updateMouse' | 'updateGamepad' | 'updateTouch' | 'reset' | 'setConfig';
  payload?: unknown;
}

export interface InteractionSnapshot {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad: GamepadState;
  touch: TouchState;
  isActive: boolean;
  config: InteractionConfig;
  metrics: InteractionMetrics;
}
