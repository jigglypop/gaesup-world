import * as THREE from 'three';

import { RegisterSystem } from '@/core/boilerplate/decorators';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import type { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import type { BaseState, BaseMetrics, SystemUpdateArgs } from '@/core/boilerplate/types';
import { logger } from '@/core/utils/logger';

import type {
  GamepadState,
  InteractionConfig,
  InteractionMetrics,
  InteractionState,
  KeyboardState,
  MouseState,
  TouchState,
} from './types';

function createDefaultKeyboardState(): KeyboardState {
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
  };
}

function createDefaultMouseState(): MouseState {
  return {
    target: new THREE.Vector3(),
    angle: 0,
    isActive: false,
    shouldRun: false,
    isLookAround: false,
    buttons: { left: false, right: false, middle: false },
    wheel: 0,
    position: new THREE.Vector2(),
  };
}

function createDefaultGamepadState(): GamepadState {
  return {
    connected: false,
    leftStick: new THREE.Vector2(),
    rightStick: new THREE.Vector2(),
    triggers: { left: 0, right: 0 },
    buttons: {},
    vibration: { weak: 0, strong: 0 },
  };
}

function createDefaultTouchState(): TouchState {
  return {
    touches: [],
    gestures: { pinch: 1, rotation: 0, pan: new THREE.Vector2() },
  };
}

function createDefaultInteractionState(): InteractionSystemState {
  return {
    keyboard: createDefaultKeyboardState(),
    mouse: createDefaultMouseState(),
    gamepad: createDefaultGamepadState(),
    touch: createDefaultTouchState(),
    lastUpdate: 0,
    isActive: true,
  };
}

function createDefaultInteractionMetrics(): InteractionSystemMetrics {
  return {
    inputLatency: 0,
    frameTime: 0,
    eventCount: 0,
    activeInputs: [],
    performanceScore: 100,
    lastUpdate: 0,
  };
}

function createDefaultInteractionConfig(): InteractionConfig {
  return {
    sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
    deadzone: { gamepad: 0.1, touch: 0.05 },
    smoothing: { mouse: 0.1, gamepad: 0.2 },
    invertY: false,
    enableVibration: true,
  };
}

function replaceOwnProperties<ValueType extends object>(
  target: ValueType,
  source: ValueType,
): void {
  for (const key of Reflect.ownKeys(target)) {
    if (!Reflect.deleteProperty(target, key)) {
      throw new Error(`Failed to delete reset property: ${String(key)}`);
    }
  }
  if (!Reflect.setPrototypeOf(target, Object.getPrototypeOf(source))) {
    throw new Error('Failed to restore reset prototype');
  }
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor || !Reflect.defineProperty(target, key, descriptor)) {
      throw new Error(`Failed to define reset property: ${String(key)}`);
    }
  }
}

function resetActiveInputs(activeInputs: string[]): void {
  if (!Reflect.setPrototypeOf(activeInputs, Array.prototype)) {
    throw new Error('Failed to restore activeInputs prototype');
  }
  for (const key of Reflect.ownKeys(activeInputs)) {
    if (key === 'length') continue;
    if (!Reflect.deleteProperty(activeInputs, key)) {
      throw new Error(`Failed to delete activeInputs property: ${String(key)}`);
    }
  }
  if (!Reflect.defineProperty(activeInputs, 'length', {
    configurable: false,
    enumerable: false,
    value: 0,
    writable: true,
  })) {
    throw new Error('Failed to reset activeInputs length');
  }
}

function findNonConfigurableOwnProperty(target: object): PropertyKey | null {
  for (const key of Reflect.ownKeys(target)) {
    if (Object.getOwnPropertyDescriptor(target, key)?.configurable === false) {
      return key;
    }
  }
  return null;
}

const KEYBOARD_KEYS: Array<keyof KeyboardState> = [
  'forward',
  'backward',
  'leftward',
  'rightward',
  'shift',
  'space',
  'keyZ',
  'keyR',
  'keyF',
  'keyE',
  'escape',
];

const MOUSE_BUTTON_KEYS: Array<keyof MouseState['buttons']> = ['left', 'right', 'middle'];
type InteractionEventPayload =
  | Partial<KeyboardState>
  | Partial<MouseState>
  | Partial<GamepadState>
  | Partial<TouchState>;

interface InteractionSystemState extends BaseState, InteractionState {}
interface InteractionSystemMetrics extends BaseMetrics, InteractionMetrics {}

@RegisterSystem('interaction')
export class InteractionSystem extends AbstractSystem<InteractionSystemState, InteractionSystemMetrics> {
  private static instance: InteractionSystem | null = null;
  private config: InteractionConfig;
  private eventCallbacks: Map<string, Array<(data: InteractionEventPayload) => void>>;
  private isResetting = false;

  public constructor() {
    super(createDefaultInteractionState(), createDefaultInteractionMetrics());
    this.config = createDefaultInteractionConfig();
    this.eventCallbacks = new Map();
  }

  static getInstance(): InteractionSystem {
    if (!InteractionSystem.instance) {
      InteractionSystem.instance = new InteractionSystem();
    }
    return InteractionSystem.instance;
  }
  protected performUpdate(args: SystemUpdateArgs): void {
    void args;
  }

  protected createUpdateArgs(context: SystemContext): SystemUpdateArgs {
    return this.createDefaultUpdateArgs(context);
  }

  getKeyboardRef(): KeyboardState {
    return this.state.keyboard;
  }

  getMouseRef(): MouseState {
    return this.state.mouse;
  }

  updateKeyboard(updates: Partial<KeyboardState>): void {
    Object.assign(this.state.keyboard, updates);
    this.updateMetrics(0);
    this.emitChange('keyboard', updates);
  }

  updateMouse(updates: Partial<MouseState>): void {
    Object.assign(this.state.mouse, updates);
    this.updateMetrics(0);
    this.emitChange('mouse', updates);
  }

  updateGamepad(updates: Partial<GamepadState>): void {
    Object.assign(this.state.gamepad, updates);
    this.updateMetrics(0);
    this.emitChange('gamepad', updates);
  }

  updateTouch(updates: Partial<TouchState>): void {
    Object.assign(this.state.touch, updates);
    this.updateMetrics(0);
    this.emitChange('touch', updates);
  }

  private emitChange(
    field: 'keyboard' | 'mouse' | 'gamepad' | 'touch',
    updates: InteractionEventPayload,
  ): void {
    const callbacks = this.eventCallbacks.get(field);
    if (!callbacks || callbacks.length === 0) return;
    for (const cb of callbacks) {
      try {
        cb(updates);
      } catch (error) {
        logger.error(
          '[InteractionSystem] Change callback failed',
          error instanceof Error ? error : String(error),
        );
      }
    }
  }

  private emitReset(): void {
    const callbacks = this.eventCallbacks.get('reset');
    if (!callbacks || callbacks.length === 0) return;

    const callbacksAtDispatchStart = callbacks.slice();
    for (const callback of callbacksAtDispatchStart) {
      try {
        callback({});
      } catch (error) {
        logger.error(
          '[InteractionSystem] Reset callback failed',
          error instanceof Error ? error : String(error),
        );
      }
    }
  }

  dispatchInput(updates: Partial<MouseState>): void {
    this.updateMouse(updates);
  }

  setConfig(updates: Partial<InteractionConfig>): void {
    Object.assign(this.config, updates);
  }

  getConfig(): InteractionConfig {
    return { ...this.config };
  }
  addEventListener(event: string, callback: (data: InteractionEventPayload) => void): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (data: InteractionEventPayload) => void): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  protected override updateMetrics(deltaTime: number): void {
    super.updateMetrics(deltaTime);
    this.metrics.eventCount++;
    this.collectActiveInputs(this.metrics.activeInputs);
  }

  // Object.entries 는 매 호출마다 새 [k,v][] 와 string concat 을 만들어 GC pressure 가 크다.
  // 대신 호출자 소유의 배열을 in-place 로 갱신한다 (활성 입력은 거의 항상 0~수개).
  private collectActiveInputs(out: string[]): void {
    out.length = 0;

    for (const key of KEYBOARD_KEYS) {
      if (this.state.keyboard[key]) out.push(`keyboard:${key}`);
    }

    for (const key of MOUSE_BUTTON_KEYS) {
      if (this.state.mouse.buttons[key]) out.push(`mouse:${key}`);
    }

    if (this.state.gamepad.connected) out.push('gamepad:connected');

    const touches = this.state.touch.touches.length;
    if (touches > 0) out.push(`touch:${touches}`);
  }

  public override reset(): void {
    if (this.isResetting) return;
    const canResetRawState = this.canResetRawState();
    const canResetActiveInputs = this.canResetActiveInputs();
    if (!canResetRawState || !canResetActiveInputs) return;

    this.isResetting = true;
    try {
      super.reset();
    } finally {
      this.isResetting = false;
    }
  }

  protected override onReset(): void {
    super.onReset();
    const keyboard = this.state.keyboard;
    const mouse = this.state.mouse;
    const gamepad = this.state.gamepad;
    const touch = this.state.touch;
    const activeInputs = this.metrics.activeInputs;
    const defaultState = createDefaultInteractionState();
    const defaultMetrics = createDefaultInteractionMetrics();

    replaceOwnProperties(keyboard, defaultState.keyboard);
    replaceOwnProperties(mouse, defaultState.mouse);
    replaceOwnProperties(gamepad, defaultState.gamepad);
    replaceOwnProperties(touch, defaultState.touch);

    defaultState.keyboard = keyboard;
    defaultState.mouse = mouse;
    defaultState.gamepad = gamepad;
    defaultState.touch = touch;
    replaceOwnProperties(this.state, defaultState);

    resetActiveInputs(activeInputs);
    defaultMetrics.activeInputs = activeInputs;
    replaceOwnProperties(this.metrics, defaultMetrics);
    this.config = createDefaultInteractionConfig();

    this.emitReset();
  }

  private canResetRawState(): boolean {
    const canResetKeyboard = this.canReplaceRawState('keyboard', this.state.keyboard);
    const canResetMouse = this.canReplaceRawState('mouse', this.state.mouse);
    const canResetGamepad = this.canReplaceRawState('gamepad', this.state.gamepad);
    const canResetTouch = this.canReplaceRawState('touch', this.state.touch);
    return canResetKeyboard && canResetMouse && canResetGamepad && canResetTouch;
  }

  private canReplaceRawState(field: string, state: object): boolean {
    let canReplace = true;
    if (!Object.isExtensible(state)) {
      logger.error(`[InteractionSystem] Reset skipped: ${field} is not extensible`);
      canReplace = false;
    }

    const key = findNonConfigurableOwnProperty(state);
    if (key !== null) {
      logger.error(
        `[InteractionSystem] Reset skipped: ${field} has a non-configurable property`,
        key,
      );
      canReplace = false;
    }
    return canReplace;
  }

  private canResetActiveInputs(): boolean {
    const activeInputs = this.metrics.activeInputs;
    let canClear = true;
    if (!Object.isExtensible(activeInputs)) {
      logger.error('[InteractionSystem] Reset skipped: activeInputs is not extensible');
      canClear = false;
    }

    const lengthDescriptor = Object.getOwnPropertyDescriptor(activeInputs, 'length');
    if (lengthDescriptor?.writable !== true) {
      logger.error('[InteractionSystem] Reset skipped: activeInputs length is not writable');
      canClear = false;
    }

    for (const key of Reflect.ownKeys(activeInputs)) {
      if (key === 'length') continue;
      if (Object.getOwnPropertyDescriptor(activeInputs, key)?.configurable === false) {
        logger.error(
          '[InteractionSystem] Reset skipped: activeInputs has a non-configurable property',
          key,
        );
        canClear = false;
      }
    }
    return canClear;
  }

  protected override onDispose(): void {
    super.onDispose();
    this.eventCallbacks.clear();
    InteractionSystem.instance = null;
  }
}

export type { KeyboardState, MouseState } from './types';
