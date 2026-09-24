import * as THREE from 'three'
 
import type { GamepadState, KeyboardState, MouseState, TouchState } from '../../input/core/types';

export type { GamepadState, KeyboardState, MouseState, TouchState };

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
