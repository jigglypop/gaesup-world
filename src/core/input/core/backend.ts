import * as THREE from 'three';

import type { GamepadState, KeyboardState, MouseState, TouchState } from './types';
import { logger } from '../../utils/logger';

export interface InputBackendSnapshot {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad?: GamepadState;
  touch?: TouchState;
}

export type InputStateListener = (state: InputBackendSnapshot) => void;

export function notifyInputStateListener(
  listener: InputStateListener,
  state: InputBackendSnapshot,
): void {
  try {
    listener(state);
  } catch (error) {
    logger.error(
      '[InteractionInputBackend] Subscriber failed',
      error instanceof Error ? error : String(error),
    );
  }
}

export interface InputBackend {
  getKeyboard(): KeyboardState;
  getMouse(): MouseState;
  getGamepad?(): GamepadState;
  getTouch?(): TouchState;
  updateKeyboard(input: Partial<KeyboardState>): void;
  updateMouse(input: Partial<MouseState>): void;
  updateGamepad?(input: Partial<GamepadState>): void;
  updateTouch?(input: Partial<TouchState>): void;
  subscribe?(listener: InputStateListener): () => void;
}

export type InputAdapter = InputBackend;

export interface InputBackendExtension {
  createAdapter: () => InputBackend;
}

export interface MemoryInputBackendInitialState {
  keyboard?: Partial<KeyboardState>;
  mouse?: Omit<Partial<MouseState>, 'buttons'> & {
    buttons?: Partial<MouseState['buttons']>;
  };
  gamepad?: Omit<Partial<GamepadState>, 'triggers' | 'vibration'> & {
    triggers?: Partial<GamepadState['triggers']>;
    vibration?: Partial<GamepadState['vibration']>;
  };
  touch?: Omit<Partial<TouchState>, 'gestures'> & {
    gestures?: Partial<TouchState['gestures']>;
  };
}

function createDefaultKeyboardState(overrides: Partial<KeyboardState> = {}): KeyboardState {
  return {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    shift: false,
    space: false,
    keyZ: false,
    keyR: false,
    keyF: false,
    keyE: false,
    escape: false,
    ...overrides,
  };
}

function createDefaultMouseState(
  overrides: MemoryInputBackendInitialState['mouse'] = {},
): MouseState {
  return {
    target: overrides.target?.clone?.() ?? new THREE.Vector3(),
    angle: overrides.angle ?? 0,
    isActive: overrides.isActive ?? false,
    shouldRun: overrides.shouldRun ?? false,
    isLookAround: overrides.isLookAround ?? false,
    buttons: {
      left: false,
      right: false,
      middle: false,
      ...overrides.buttons,
    },
    wheel: overrides.wheel ?? 0,
    position: overrides.position?.clone?.() ?? new THREE.Vector2(),
  };
}

function createDefaultGamepadState(
  overrides: MemoryInputBackendInitialState['gamepad'] = {},
): GamepadState {
  return {
    connected: overrides.connected ?? false,
    leftStick: overrides.leftStick?.clone?.() ?? new THREE.Vector2(),
    rightStick: overrides.rightStick?.clone?.() ?? new THREE.Vector2(),
    triggers: {
      left: 0,
      right: 0,
      ...overrides.triggers,
    },
    buttons: { ...overrides.buttons },
    vibration: {
      weak: 0,
      strong: 0,
      ...overrides.vibration,
    },
  };
}

function createDefaultTouchState(
  overrides: MemoryInputBackendInitialState['touch'] = {},
): TouchState {
  return {
    touches: overrides.touches?.map((touch) => ({
      id: touch.id,
      position: touch.position.clone(),
      force: touch.force,
    })) ?? [],
    gestures: {
      pinch: 1,
      rotation: 0,
      pan: new THREE.Vector2(),
      ...overrides.gestures,
      ...(overrides.gestures?.pan ? { pan: overrides.gestures.pan.clone() } : {}),
    },
  };
}

function updateMouseState(mouse: MouseState, input: Partial<MouseState>): void {
  const { buttons, target, position, ...rest } = input;
  Object.assign(mouse, rest);
  if (target) mouse.target.copy(target);
  if (position) mouse.position.copy(position);
  if (buttons) Object.assign(mouse.buttons, buttons);
}

function updateGamepadState(gamepad: GamepadState, input: Partial<GamepadState>): void {
  const { leftStick, rightStick, triggers, vibration, buttons, ...rest } = input;
  Object.assign(gamepad, rest);
  if (leftStick) gamepad.leftStick.copy(leftStick);
  if (rightStick) gamepad.rightStick.copy(rightStick);
  if (triggers) Object.assign(gamepad.triggers, triggers);
  if (vibration) Object.assign(gamepad.vibration, vibration);
  if (buttons) Object.assign(gamepad.buttons, buttons);
}

function updateTouchState(touch: TouchState, input: Partial<TouchState>): void {
  const { touches, gestures } = input;
  if (touches) {
    touch.touches = touches.map((entry) => ({
      id: entry.id,
      position: entry.position.clone(),
      force: entry.force,
    }));
  }
  if (gestures) {
    const { pan, ...rest } = gestures;
    Object.assign(touch.gestures, rest);
    if (pan) touch.gestures.pan.copy(pan);
  }
}

export function createMemoryInputBackend(
  initialState: MemoryInputBackendInitialState = {},
): InputBackend {
  const listeners = new Set<InputStateListener>();
  const state = {
    keyboard: createDefaultKeyboardState(initialState.keyboard),
    mouse: createDefaultMouseState(initialState.mouse),
    gamepad: createDefaultGamepadState(initialState.gamepad),
    touch: createDefaultTouchState(initialState.touch),
  };
  const snapshot = (): InputBackendSnapshot => state;
  const emit = () => {
    const current = snapshot();
    listeners.forEach((listener) => listener(current));
  };

  return {
    getKeyboard: () => state.keyboard,
    getMouse: () => state.mouse,
    getGamepad: () => state.gamepad,
    getTouch: () => state.touch,
    updateKeyboard: (input) => {
      Object.assign(state.keyboard, input);
      emit();
    },
    updateMouse: (input) => {
      updateMouseState(state.mouse, input);
      emit();
    },
    updateGamepad: (input) => {
      updateGamepadState(state.gamepad, input);
      emit();
    },
    updateTouch: (input) => {
      updateTouchState(state.touch, input);
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(snapshot());
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
