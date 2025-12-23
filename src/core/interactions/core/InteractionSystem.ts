import * as THREE from 'three';

import { RegisterSystem, ManageRuntime } from '@/core/boilerplate/decorators';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import type { BaseState, BaseMetrics, SystemUpdateArgs } from '@/core/boilerplate/types';

import { InteractionState, InteractionConfig, InteractionMetrics, KeyboardState, MouseState, GamepadState, TouchState } from '../bridge';

interface InteractionSystemState extends BaseState, InteractionState {}
interface InteractionSystemMetrics extends BaseMetrics, InteractionMetrics {}

@RegisterSystem('interaction')
@ManageRuntime({ autoStart: true })
export class InteractionSystem extends AbstractSystem<InteractionSystemState, InteractionSystemMetrics> {
  private static instance: InteractionSystem | null = null;
  private config: InteractionConfig;
  private eventCallbacks: Map<string, Function[]>;

  // public으로 변경
  public constructor() {
    // ... super() 호출은 동일
    super(
      {
        keyboard: { forward: false, backward: false, leftward: false, rightward: false, shift: false, space: false, keyZ: false, keyR: false, keyF: false, keyE: false, escape: false },
        mouse: { target: new THREE.Vector3(), angle: 0, isActive: false, shouldRun: false, buttons: { left: false, right: false, middle: false }, wheel: 0, position: new THREE.Vector2() },
        gamepad: { connected: false, leftStick: new THREE.Vector2(), rightStick: new THREE.Vector2(), triggers: { left: 0, right: 0 }, buttons: {}, vibration: { weak: 0, strong: 0 } },
        touch: { touches: [], gestures: { pinch: 1, rotation: 0, pan: new THREE.Vector2() } },
        lastUpdate: 0,
        isActive: true
      },
      {
        inputLatency: 0,
        frameTime: 0,
        eventCount: 0,
        activeInputs: [],
        performanceScore: 100,
        lastUpdate: 0
      }
    );
    this.config = this.createDefaultConfig();
    this.eventCallbacks = new Map();
  }

  static getInstance(): InteractionSystem {
    if (!InteractionSystem.instance) {
      InteractionSystem.instance = new InteractionSystem();
    }
    return InteractionSystem.instance;
  }
  
  // ... 나머지 코드는 거의 동일

  protected performUpdate(args: SystemUpdateArgs): void {
    void args;
  }

  private createDefaultConfig(): InteractionConfig {
    return {
      sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
      deadzone: { gamepad: 0.1, touch: 0.05 },
      smoothing: { mouse: 0.1, gamepad: 0.2 },
      invertY: false,
      enableVibration: true
    };
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
  }

  updateMouse(updates: Partial<MouseState>): void {
    Object.assign(this.state.mouse, updates);
    this.updateMetrics(0);
  }

  updateGamepad(updates: Partial<GamepadState>): void {
    Object.assign(this.state.gamepad, updates);
    this.updateMetrics(0);
  }

  updateTouch(updates: Partial<TouchState>): void {
    Object.assign(this.state.touch, updates);
    this.updateMetrics(0);
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
  
  // getState, getMetrics는 AbstractSystem에 이미 있으므로 제거

  addEventListener(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
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
    this.metrics.activeInputs = this.getActiveInputs();
  }

  private getActiveInputs(): string[] {
    const active: string[] = [];
    
    Object.entries(this.state.keyboard).forEach(([key, value]) => {
      if (value) active.push(`keyboard:${key}`);
    });
    
    Object.entries(this.state.mouse.buttons).forEach(([key, value]) => {
      if (value) active.push(`mouse:${key}`);
    });
    
    if (this.state.gamepad.connected) {
      active.push('gamepad:connected');
    }
    
    if (this.state.touch.touches.length > 0) {
      active.push(`touch:${this.state.touch.touches.length}`);
    }
    
    return active;
  }

  protected override onReset(): void {
    super.onReset();
    this.eventCallbacks.clear();
  }
  
  protected override onDispose(): void {
    super.onDispose();
    InteractionSystem.instance = null;
  }
}

export type { KeyboardState, MouseState } from '../bridge';
