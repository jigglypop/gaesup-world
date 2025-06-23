import * as THREE from 'three';

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
  inputLatency: number;
  frameTime: number;
  eventCount: number;
  activeInputs: string[];
  performanceScore: number;
}

export class InteractionEngine {
  private state: InteractionState;
  private config: InteractionConfig;
  private metrics: InteractionMetrics;
  private eventCallbacks: Map<string, Function[]>;

  constructor() {
    this.state = this.createDefaultState();
    this.config = this.createDefaultConfig();
    this.metrics = this.createDefaultMetrics();
    this.eventCallbacks = new Map();
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
      performanceScore: 100
    };
  }

  updateKeyboard(updates: Partial<KeyboardState>): void {
    Object.assign(this.state.keyboard, updates);
    this.updateMetrics();
  }

  updateMouse(updates: Partial<MouseState>): void {
    Object.assign(this.state.mouse, updates);
    this.updateMetrics();
  }

  updateGamepad(updates: Partial<GamepadState>): void {
    Object.assign(this.state.gamepad, updates);
    this.updateMetrics();
  }

  updateTouch(updates: Partial<TouchState>): void {
    Object.assign(this.state.touch, updates);
    this.updateMetrics();
  }

  setConfig(updates: Partial<InteractionConfig>): void {
    Object.assign(this.config, updates);
  }

  getState(): InteractionState {
    return { ...this.state };
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

  private updateMetrics(): void {
    this.metrics.eventCount++;
    this.metrics.lastUpdate = Date.now();
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

  reset(): void {
    this.state = this.createDefaultState();
    this.metrics = this.createDefaultMetrics();
    this.eventCallbacks.clear();
  }

  dispose(): void {
    this.reset();
  }
}
