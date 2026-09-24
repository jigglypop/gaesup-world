import * as THREE from 'three';

import type { RuntimeRecord } from '@core/boilerplate/types';

import { ActiveStateType } from '../../motions/core/types';

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

export type CameraCollisionTargets = 'scene' | 'colliders';

export interface CameraBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
}

export interface CameraOption {
  offset?: THREE.Vector3;
  maxDistance?: number;
  distance?: number;
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  zoom?: number;
  enableZoom?: boolean;
  zoomSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
  target?: THREE.Vector3;
  position?: THREE.Vector3;
  focus?: boolean;
  focusTarget?: THREE.Vector3;
  focusDuration?: number;
  focusDistance?: number;
  focusLerpSpeed?: number;
  enableFocus?: boolean;
  enableCollision?: boolean;
  collisionMargin?: number;
  /** 'colliders' tests only meshes on CAMERA_COLLIDER_LAYER and falls back to the whole scene when none exist. */
  collisionTargets?: CameraCollisionTargets;
  smoothing?: {
    position?: number;
    rotation?: number;
    fov?: number;
  };
  fov?: number;
  minFov?: number;
  maxFov?: number;
  bounds?: CameraBounds;
  mode?: string;
  fixedPosition?: THREE.Vector3;
  rotation?: THREE.Euler;
  isoAngle?: number;
  modeSettings?: {
    character?: {
      distance?: number;
      height?: number;
      angle?: number;
    };
    vehicle?: {
      distance?: number;
      height?: number;
      angle?: number;
    };
    airplane?: {
      distance?: number;
      height?: number;
      angle?: number;
    };
  };
}

export type CameraOptionType = CameraOption;

export type CameraType = 
  | 'thirdPerson'
  | 'firstPerson'
  | 'topDown'
  | 'sideScroll'
  | 'isometric'
  | 'fixed'
  | 'chase';

export interface CameraConfig {
  shoulderOffset?: THREE.Vector3;
  distance?: { x: number; y: number; z: number; };
  smoothing?: { position: number; rotation: number; fov: number; };
  enableCollision?: boolean;
  orbitYaw?: number;
  orbitPitch?: number;
  height?: number;
  lockTarget?: boolean;
  followSpeed?: number;
  rotationSpeed?: number;
  constraints?: {
    minDistance?: number;
    maxDistance?: number;
    minAngle?: number;
    maxAngle?: number;
  };
}

export interface CameraTransitionCondition {
  type: 'timer' | 'event' | 'distance' | 'custom';
  value?: number | string;
  target?: string;
  callback?: () => boolean;
}

export interface CameraState {
  name: string;
  type: CameraType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  config: CameraConfig;
  priority: number;
  tags: string[];
}

export interface CameraTransition {
  from: string;
  to: string;
  duration: number;
  easing?: string;
  conditions?: CameraTransitionCondition[];
}

export type CameraRuntimeState = {
  orbitYaw: number;
  orbitPitch: number;
};

export interface CameraSystemState {
  config: CameraSystemConfig;
  runtime?: CameraRuntimeState;
  activeController?: ICameraController;
  lastUpdate: number; // 추가
}

export interface CameraSystemConfig {
  mode: string;
  distance: {
    x: number;
    y: number;
    z: number;
  };
  bounds?: CameraBounds; // optional로 변경
  enableCollision: boolean;
  collisionMargin?: number;
  collisionTargets?: CameraCollisionTargets;
  orbitYaw?: number;
  orbitPitch?: number;
  smoothing?: {
    position: number;
    rotation: number;
    fov: number;
  };
  fov?: number;
  focus?: boolean;
  focusTarget?: { x: number; y: number; z: number } | undefined;
  focusDistance?: number;
  focusLerpSpeed?: number;
  zoom?: number;
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  fixedPosition?: THREE.Vector3;
  fixedLookAt?: THREE.Vector3;
}

export interface CameraCalcProps {
  camera: THREE.Camera;
  scene: THREE.Scene;
  deltaTime: number;
  activeState: ActiveStateType;
  /** @deprecated Optional legacy renderer clock. Camera calculations use deltaTime. */
  clock?: THREE.Clock | undefined;
  excludeObjects?: THREE.Object3D[];
}

export interface ICameraController {
  name: string;
  defaultConfig: Partial<CameraSystemConfig>;
  update(props: CameraCalcProps, state: CameraSystemState): void;
}

export interface Obstacle {
  object: THREE.Mesh;
  /** World-space distance from the query origin to the surface contact point. */
  distance: number;
  /** Caller-owned contact point, unchanged by subsequent queries. */
  point: THREE.Vector3;
}

export interface CollisionCheckResult {
  safe: boolean;
  /** Caller-owned camera center; includes the requested collision radius. */
  position: THREE.Vector3;
  obstacles: Obstacle[];
}

export interface CameraPropType {
  state: { delta: number } & RuntimeRecord;
  worldContext: {
    activeState: ActiveStateType;
  };
  cameraOption: CameraOptionType;
  controllerOptions?: RuntimeRecord;
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

 
