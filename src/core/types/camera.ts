import * as THREE from 'three';

export interface CameraConstants {
  THROTTLE_MS: number;
  POSITION_THRESHOLD: number;
  TARGET_THRESHOLD: number;
  DEFAULT_LERP_SPEED: number;
  DEFAULT_FOV_LERP: number;
  MIN_FOV: number;
  MAX_FOV: number;
  FRAME_RATE_LERP_SPEED: number;
}

export interface Obstacle {
  object: THREE.Object3D;
  distance: number;
  point: THREE.Vector3;
}

export interface CollisionCheckResult {
  safe: boolean;
  position: THREE.Vector3;
  obstacles: Obstacle[];
}

export interface CameraBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
}

export interface CameraOption {
  type?: 'orthographic' | 'perspective';
  fov?: number;
  near?: number;
  far?: number;
  zoom?: number;
  bounds?: CameraBounds;
  position?: THREE.Vector3;
  lookAt?: THREE.Vector3;
}

export interface CameraState {
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  target?: THREE.Vector3;
}

export interface CameraTransition {
  from: string;
  to: string;
  duration: number;
  blendFunction?: string;
  condition?: () => boolean;
}

export interface CameraPropType {
  state: any;
  worldContext: any;
  cameraOption: any;
  controllerOptions?: any;
}

export interface CameraShakeConfig {
  intensity: number;
  duration: number;
  frequency: number;
  decay: boolean;
}

export interface CameraZoomConfig {
  targetFov: number;
  duration: number;
  easing: (t: number) => number;
} 