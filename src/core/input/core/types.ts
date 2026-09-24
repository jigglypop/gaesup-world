import type * as THREE from 'three';

export type KeyboardState = {
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
};

export type MouseState = {
  target: THREE.Vector3;
  angle: number;
  isActive: boolean;
  /** Set when movement reaches its target. moveTo clears this before starting. */
  hasArrived?: boolean;
  shouldRun: boolean;
  isLookAround?: boolean;
  buttons: {
    left: boolean;
    right: boolean;
    middle: boolean;
  };
  wheel: number;
  position: THREE.Vector2;
};

export type GamepadState = {
  connected: boolean;
  leftStick: THREE.Vector2;
  rightStick: THREE.Vector2;
  triggers: { left: number; right: number };
  buttons: Record<string, boolean>;
  vibration: { weak: number; strong: number };
};

export type TouchState = {
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
};
