import * as THREE from 'three';
import { CameraOptionType, gaesupWorldContextType } from '../world/context/type';

export interface CameraPropType {
  state?: { camera?: THREE.Camera };
  worldContext: Partial<gaesupWorldContextType>;
  cameraOption: CameraOptionType;
}


export interface CameraDistanceOptions {
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  XDistance?: number;
  YDistance?: number;
  ZDistance?: number;
}

export interface CameraPositionCalculation {
  currentPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  distance: number;
  direction: THREE.Vector3;
}

export interface CameraCollisionOptions {
  enableCollision?: boolean;
  collisionMargin?: number;
  minDistance?: number;
  maxDistance?: number;
}

export interface CameraCollisionResult {
  position: THREE.Vector3;
  hasCollision: boolean;
  collisionDistance?: number;
}

export interface CameraSmoothingOptions {
  position?: number;
  rotation?: number;
  fov?: number;
}

export interface CameraLerpCalculation {
  adaptiveLerpSpeed: number;
  baseLerpSpeed: number;
  speedMultiplier: number;
}

export interface CameraBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
}

export interface CameraBoundResult {
  position: THREE.Vector3;
  clamped: boolean;
  clampedAxes: ('x' | 'y' | 'z')[];
}

export type CameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  intersects: THREE.Intersection<THREE.Mesh>[];
  detected: THREE.Intersection<THREE.Mesh>[];
  intersectObjectMap: { [uuid: string]: THREE.Mesh };
};

export interface CameraControlState {
  isTransitioning: boolean;
  lastUpdateTime: number;
  currentMode: string;
  targetReached: boolean;
}

export interface CameraTransitionOptions {
  duration?: number;
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
  onComplete?: () => void;
}


export type Vector3Like = {
  x: number;
  y: number;
  z: number;
} | THREE.Vector3;

export interface CameraUtils {
  toVector3: (position: Vector3Like) => THREE.Vector3;
  clamp: (value: number, min: number, max: number) => number;
  lerp: (start: number, end: number, factor: number) => number;
}

export interface CameraTransform {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export interface CameraLerpConfig {
  position: number;
  rotation: number;
  fov: number;
}

export interface CameraCollisionConfig {
  enabled: boolean;
  margin: number;
  minDistance: number;
}

export interface CameraDistance {
  x: number;
  y: number;
  z: number;
}

export type CameraControlFunction = (prop: CameraPropType) => void;

export interface CameraUpdateData {
  position?: THREE.Vector3;
  target?: THREE.Vector3;
  fov?: number;
  force?: boolean;
}
