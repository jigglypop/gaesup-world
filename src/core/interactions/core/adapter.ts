import * as THREE from 'three';

import { InteractionSystem } from './InteractionSystem';
import type { GamepadState, KeyboardState, MouseState, TouchState } from '../bridge';

export const DEFAULT_INTERACTION_INPUT_EXTENSION_ID = 'interaction.input';

export interface InputBackendSnapshot {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad?: GamepadState;
  touch?: TouchState;
}

export type InputStateListener = (state: InputBackendSnapshot) => void;

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

export type InteractionSystemResolver = () => InteractionSystem;

export interface MemoryInputBackendInitialState {
  keyboard?: Partial<KeyboardState>;
  mouse?: Partial<MouseState> & {
    buttons?: Partial<MouseState['buttons']>;
  };
  gamepad?: Partial<GamepadState> & {
    triggers?: Partial<GamepadState['triggers']>;
    vibration?: Partial<GamepadState['vibration']>;
  };
  touch?: Partial<TouchState> & {
    gestures?: Partial<TouchState['gestures']>;
  };
}

let defaultInteractionSystemResolver: InteractionSystemResolver = () => InteractionSystem.getInstance();

export function resolveDefaultInteractionSystem(): InteractionSystem {
  return defaultInteractionSystemResolver();
}

export function setDefaultInteractionSystemResolver(
  resolver: InteractionSystemResolver,
): () => void {
  const previousResolver = defaultInteractionSystemResolver;
  defaultInteractionSystemResolver = resolver;
  defaultInteractionInputBackend.invalidate();

  return () => {
    defaultInteractionSystemResolver = previousResolver;
    defaultInteractionInputBackend.invalidate();
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

export function createInteractionSystemInputBackend(
  system: InteractionSystem,
): InputBackend {
  const snapshot = (): InputBackendSnapshot => {
    const state = system.getState();
    return {
      keyboard: system.getKeyboardRef(),
      mouse: system.getMouseRef(),
      gamepad: state.gamepad,
      touch: state.touch,
    };
  };

  return {
    getKeyboard: () => system.getKeyboardRef(),
    getMouse: () => system.getMouseRef(),
    getGamepad: () => system.getState().gamepad,
    getTouch: () => system.getState().touch,
    updateKeyboard: (input) => system.updateKeyboard(input),
    updateMouse: (input) => system.updateMouse(input),
    updateGamepad: (input) => system.updateGamepad(input),
    updateTouch: (input) => system.updateTouch(input),
    subscribe: (listener) => {
      const emit = () => listener(snapshot());
      system.addEventListener('keyboard', emit);
      system.addEventListener('mouse', emit);
      system.addEventListener('gamepad', emit);
      system.addEventListener('touch', emit);
      emit();
      return () => {
        system.removeEventListener('keyboard', emit);
        system.removeEventListener('mouse', emit);
        system.removeEventListener('gamepad', emit);
        system.removeEventListener('touch', emit);
      };
    },
  };
}

class DefaultInteractionInputBackend implements InputBackend {
  private system: InteractionSystem | null = null;
  private backend: InputBackend | null = null;
  private unsubscribeFromBackend: (() => void) | null = null;
  private readonly listeners = new Set<InputStateListener>();

  invalidate(): void {
    this.unsubscribeFromBackend?.();
    this.unsubscribeFromBackend = null;
    this.backend = null;
    this.system = null;
  }

  getKeyboard(): KeyboardState {
    return this.resolveBackend().getKeyboard();
  }

  getMouse(): MouseState {
    return this.resolveBackend().getMouse();
  }

  getGamepad(): GamepadState {
    return this.resolveBackend().getGamepad?.() ?? this.resolveDefaultGamepad();
  }

  getTouch(): TouchState {
    return this.resolveBackend().getTouch?.() ?? this.resolveDefaultTouch();
  }

  updateKeyboard(input: Partial<KeyboardState>): void {
    this.resolveSubscribedBackend().updateKeyboard(input);
  }

  updateMouse(input: Partial<MouseState>): void {
    this.resolveSubscribedBackend().updateMouse(input);
  }

  updateGamepad(input: Partial<GamepadState>): void {
    this.resolveSubscribedBackend().updateGamepad?.(input);
  }

  updateTouch(input: Partial<TouchState>): void {
    this.resolveSubscribedBackend().updateTouch?.(input);
  }

  subscribe(listener: InputStateListener): () => void {
    this.listeners.add(listener);
    const emittedInitialState = this.ensureSubscription();
    if (!emittedInitialState) {
      listener(this.snapshot());
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.unsubscribeFromBackend?.();
        this.unsubscribeFromBackend = null;
      }
    };
  }

  private resolveBackend(): InputBackend {
    const nextSystem = resolveDefaultInteractionSystem();
    if (this.system !== nextSystem || !this.backend) {
      this.unsubscribeFromBackend?.();
      this.unsubscribeFromBackend = null;
      this.system = nextSystem;
      this.backend = createInteractionSystemInputBackend(nextSystem);
    }
    return this.backend;
  }

  private resolveSubscribedBackend(): InputBackend {
    const backend = this.resolveBackend();
    if (this.listeners.size > 0) {
      this.bindBackend(backend);
    }
    return backend;
  }

  private ensureSubscription(): boolean {
    const backend = this.resolveBackend();
    return this.bindBackend(backend);
  }

  private bindBackend(backend: InputBackend): boolean {
    if (this.unsubscribeFromBackend || !backend.subscribe) return false;

    this.unsubscribeFromBackend = backend.subscribe((state) => {
      this.listeners.forEach((listener) => listener(state));
    });
    return true;
  }

  private snapshot(): InputBackendSnapshot {
    const backend = this.resolveBackend();
    const snapshot: InputBackendSnapshot = {
      keyboard: backend.getKeyboard(),
      mouse: backend.getMouse(),
    };
    const gamepad = backend.getGamepad?.();
    const touch = backend.getTouch?.();
    if (gamepad) snapshot.gamepad = gamepad;
    if (touch) snapshot.touch = touch;
    return snapshot;
  }

  private resolveDefaultGamepad(): GamepadState {
    return resolveDefaultInteractionSystem().getState().gamepad;
  }

  private resolveDefaultTouch(): TouchState {
    return resolveDefaultInteractionSystem().getState().touch;
  }
}

const defaultInteractionInputBackend = new DefaultInteractionInputBackend();

export function getDefaultInteractionInputBackend(): InputBackend {
  return defaultInteractionInputBackend;
}

export function createDefaultInteractionInputBackend(): InputBackend {
  return getDefaultInteractionInputBackend();
}

export function createInteractionInputAdapter(system?: InteractionSystem): InputAdapter {
  if (system) return createInteractionSystemInputBackend(system);
  return createDefaultInteractionInputBackend();
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
