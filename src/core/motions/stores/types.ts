import * as THREE from 'three';

export interface MotionState {
  isActive: boolean;
  currentPreset: string;
  motionType: 'character' | 'vehicle' | 'airplane';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
  direction: THREE.Vector3;
  isGrounded: boolean;
  isMoving: boolean;
  lastUpdate: number;
}

export interface MotionConfig {
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  turnSpeed: number;
  jumpForce: number;
  gravity: number;
  linearDamping: number;
  angularDamping: number;
}

export interface MotionMetrics {
  currentSpeed: number;
  averageSpeed: number;
  totalDistance: number;
  frameTime: number;
  physicsTime: number;
  isAccelerating: boolean;
  groundContact: boolean;
  lastPosition: THREE.Vector3;
}

export interface MotionSliceState {
  motion: MotionState;
  config: MotionConfig;
  metrics: MotionMetrics;
  entities: Map<string, MotionState>;
  activeEntityId: string | null;
}

export interface MotionActions {
  setMotionActive: (active: boolean) => void;
  setCurrentPreset: (preset: string) => void;
  setMotionType: (type: 'character' | 'vehicle' | 'airplane') => void;
  updatePosition: (position: THREE.Vector3) => void;
  updateVelocity: (velocity: THREE.Vector3) => void;
  updateRotation: (rotation: THREE.Euler) => void;
  setGrounded: (grounded: boolean) => void;
  updateConfig: (config: Partial<MotionConfig>) => void;
  updateMetrics: (metrics: Partial<MotionMetrics>) => void;
  registerEntity: (id: string, state: MotionState) => void;
  unregisterEntity: (id: string) => void;
  setActiveEntity: (id: string) => void;
  resetMotion: () => void;
}
