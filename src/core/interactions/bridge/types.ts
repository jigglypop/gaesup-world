import * as THREE from 'three';

import type {
  AutomationAction,
  AutomationConfig,
  AutomationMetrics,
  AutomationSettings,
  AutomationState,
  GamepadState,
  InteractionConfig,
  InteractionMetrics,
  InteractionState,
  KeyboardState,
  MouseState,
  TouchState,
} from '../core/types';

export type {
  AutomationAction,
  AutomationConfig,
  AutomationMetrics,
  AutomationSettings,
  AutomationState,
  GamepadState,
  InteractionConfig,
  InteractionMetrics,
  InteractionState,
  KeyboardState,
  MouseState,
  TouchState,
} from '../core/types';

export type InteractionPayload = object | string | number | boolean | null | undefined;

export interface BridgeCommand {
  type: 'input' | 'automation';
  action: string;
  data?: InteractionPayload;
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
  data?: InteractionPayload;
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

export interface InteractionCommand {
  type: 'updateKeyboard' | 'updateMouse' | 'updateGamepad' | 'updateTouch' | 'reset' | 'setConfig';
  payload?: InteractionPayload;
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
