import { BaseSystem, SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { Profile, HandleError } from '@/core/boilerplate/decorators';
import * as THREE from 'three';
import { InteractionState, InteractionConfig, InteractionMetrics, KeyboardState, MouseState, GamepadState, TouchState } from '../bridge';

export class InteractionSystem implements BaseSystem {
  private static instance: InteractionSystem | null = null;
  
  private stateRef: InteractionState;
  private config: InteractionConfig;
  private metrics: InteractionMetrics;
  private eventCallbacks: Map<string, Function[]>;

  private constructor() {
    this.stateRef = this.createDefaultState();
    this.config = this.createDefaultConfig();
    this.metrics = this.createDefaultMetrics();
    this.eventCallbacks = new Map();
  }

  static getInstance(): InteractionSystem {
    if (!InteractionSystem.instance) {
      InteractionSystem.instance = new InteractionSystem();
    }
    return InteractionSystem.instance;
  }

  @Profile()
  @HandleError()
  async init(): Promise<void> {
    // 초기화 로직이 필요한 경우 여기에 추가
  }

  @Profile()
  @HandleError()
  update(context: SystemContext): void {
    this.stateRef.lastUpdate = Date.now();
    // 추가 업데이트 로직이 필요한 경우 여기에 추가
  }

  private createDefaultState(): InteractionState {
    return {
      keyboard: {
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
        escape: false
      },
      mouse: {
        target: new THREE.Vector3(),
        angle: 0,
        isActive: false,
        shouldRun: false,
        buttons: { left: false, right: false, middle: false },
        wheel: 0,
        position: new THREE.Vector2()
      },
      gamepad: {
        connected: false,
        leftStick: new THREE.Vector2(),
        rightStick: new THREE.Vector2(),
        triggers: { left: 0, right: 0 },
        buttons: {},
        vibration: { weak: 0, strong: 0 }
      },
      touch: {
        touches: [],
        gestures: {
          pinch: 1,
          rotation: 0,
          pan: new THREE.Vector2()
        }
      },
      lastUpdate: 0,
      isActive: true
    };
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

  private createDefaultMetrics(): InteractionMetrics {
    return {
      inputLatency: 0,
      frameTime: 0,
      eventCount: 0,
      activeInputs: [],
      performanceScore: 100,
      lastUpdate: 0
    };
  }

  getStateRef(): InteractionState {
    return this.stateRef;
  }

  getKeyboardRef(): KeyboardState {
    return this.stateRef.keyboard;
  }

  getMouseRef(): MouseState {
    return this.stateRef.mouse;
  }

  @HandleError()
  updateKeyboard(updates: Partial<KeyboardState>): void {
    Object.assign(this.stateRef.keyboard, updates);
    this.updateMetrics();
  }

  @HandleError()
  updateMouse(updates: Partial<MouseState>): void {
    Object.assign(this.stateRef.mouse, updates);
    this.updateMetrics();
  }

  @HandleError()
  updateGamepad(updates: Partial<GamepadState>): void {
    Object.assign(this.stateRef.gamepad, updates);
    this.updateMetrics();
  }

  @HandleError()
  updateTouch(updates: Partial<TouchState>): void {
    Object.assign(this.stateRef.touch, updates);
    this.updateMetrics();
  }

  @HandleError()
  dispatchInput(updates: Partial<MouseState>): void {
    this.updateMouse(updates);
  }

  setConfig(updates: Partial<InteractionConfig>): void {
    Object.assign(this.config, updates);
  }

  getState(): InteractionState {
    return { ...this.stateRef };
  }

  getConfig(): InteractionConfig {
    return { ...this.config };
  }

  getMetrics(): InteractionMetrics {
    return { ...this.metrics };
  }

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

  @Profile()
  private updateMetrics(): void {
    this.metrics.eventCount++;
    this.metrics.lastUpdate = Date.now();
    this.metrics.activeInputs = this.getActiveInputs();
  }

  private getActiveInputs(): string[] {
    const active: string[] = [];
    
    Object.entries(this.stateRef.keyboard).forEach(([key, value]) => {
      if (value) active.push(`keyboard:${key}`);
    });
    
    Object.entries(this.stateRef.mouse.buttons).forEach(([key, value]) => {
      if (value) active.push(`mouse:${key}`);
    });
    
    if (this.stateRef.gamepad.connected) {
      active.push('gamepad:connected');
    }
    
    if (this.stateRef.touch.touches.length > 0) {
      active.push(`touch:${this.stateRef.touch.touches.length}`);
    }
    
    return active;
  }

  @HandleError()
  reset(): void {
    this.stateRef = this.createDefaultState();
    this.metrics = this.createDefaultMetrics();
    this.eventCallbacks.clear();
  }

  @HandleError()
  dispose(): void {
    this.reset();
    InteractionSystem.instance = null;
  }
}

export type { KeyboardState, MouseState } from '../bridge';
