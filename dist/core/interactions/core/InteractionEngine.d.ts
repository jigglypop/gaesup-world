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
    triggers: {
        left: number;
        right: number;
    };
    buttons: Record<string, boolean>;
    vibration: {
        weak: number;
        strong: number;
    };
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
export declare class InteractionEngine {
    private state;
    private config;
    private metrics;
    private eventCallbacks;
    constructor();
    private createDefaultState;
    private createDefaultConfig;
    private createDefaultMetrics;
    updateKeyboard(updates: Partial<KeyboardState>): void;
    updateMouse(updates: Partial<MouseState>): void;
    updateGamepad(updates: Partial<GamepadState>): void;
    updateTouch(updates: Partial<TouchState>): void;
    setConfig(updates: Partial<InteractionConfig>): void;
    getState(): InteractionState;
    getConfig(): InteractionConfig;
    getMetrics(): InteractionMetrics;
    addEventListener(event: string, callback: Function): void;
    removeEventListener(event: string, callback: Function): void;
    private updateMetrics;
    private getActiveInputs;
    reset(): void;
    dispose(): void;
}
