import * as THREE from 'three';

export interface KeyboardInputState {
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

export interface MouseInputState {
  target: THREE.Vector3;
  angle: number;
  isActive: boolean;
  shouldRun: boolean;
}

export interface GamepadInputState {
  connected: boolean;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
}

export interface ClickerQueueItem {
  action: 'move' | 'click' | 'wait' | 'custom';
  target?: THREE.Vector3;
  beforeCB?: () => void;
  afterCB?: () => void;
  time?: number;
  data?: Record<string, unknown>;
}

export interface ClickerOptionInputState {
  isRun: boolean;
  throttle: number;
  autoStart: boolean;
  track: boolean;
  loop: boolean;
  queue: ClickerQueueItem[];
  line: boolean;
}

export interface inputState {
  keyboard: KeyboardInputState;
  pointer: MouseInputState;
  gamepad: GamepadInputState;
  clickerOption: ClickerOptionInputState;
}

export interface InputSlice {
  input: inputState;
  setKeyboard: (update: Partial<KeyboardInputState>) => void;
  setPointer: (update: Partial<MouseInputState>) => void;
}
