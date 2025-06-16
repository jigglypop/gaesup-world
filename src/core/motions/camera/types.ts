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
