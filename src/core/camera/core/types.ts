import * as THREE from 'three';

import type { RuntimeRecord } from '@core/boilerplate/types';

import { ActiveStateType } from '../../motions/core/types';

export type CameraConstants = {
  THROTTLE_MS: number;
  POSITION_THRESHOLD: number;
  TARGET_THRESHOLD: number;
  DEFAULT_LERP_SPEED: number;
  DEFAULT_FOV_LERP: number;
  MIN_FOV: number;
  MAX_FOV: number;
  FRAME_RATE_LERP_SPEED: number;
};

export type CameraBounds = {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
};

export type CameraOption = {
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
};

export type CameraOptionType = CameraOption;

export type CameraType = 
  | 'thirdPerson'
  | 'firstPerson'
  | 'topDown'
  | 'sideScroll'
  | 'isometric'
  | 'fixed'
  | 'chase';

export type CameraConfig = {
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
};

export type CameraTransitionCondition = {
  type: 'timer' | 'event' | 'distance' | 'custom';
  value?: number | string;
  target?: string;
  callback?: () => boolean;
};

export type CameraState = {
  name: string;
  type: CameraType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  config: CameraConfig;
  priority: number;
  tags: string[];
};

export type CameraTransition = {
  from: string;
  to: string;
  duration: number;
  easing?: string;
  conditions?: CameraTransitionCondition[];
};

export type CameraSystemState = {
  config: CameraSystemConfig;
  activeController?: ICameraController;
  lastUpdate: number; // 추가
};

export type CameraSystemConfig = {
  mode: string;
  distance: {
    x: number;
    y: number;
    z: number;
  };
  bounds?: CameraBounds; // optional로 변경
  enableCollision: boolean;
  collisionMargin?: number;
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
};

export type CameraCalcProps = {
  camera: THREE.Camera;
  scene: THREE.Scene;
  deltaTime: number;
  activeState: ActiveStateType;
  /** @deprecated Optional legacy renderer clock. Camera calculations use deltaTime. */
  clock?: THREE.Clock | undefined;
  excludeObjects?: THREE.Object3D[];
};

export type ICameraController = {
  name: string;
  defaultConfig: Partial<CameraSystemConfig>;
  update(props: CameraCalcProps, state: CameraSystemState): void;
};

export type Obstacle = {
  object: THREE.Mesh;
  distance: number;
  point: THREE.Vector3;
};

export type CollisionCheckResult = {
  safe: boolean;
  position: THREE.Vector3;
  obstacles: Obstacle[];
};

export type CameraPropType = {
  state: { delta: number } & RuntimeRecord;
  worldContext: {
    activeState: ActiveStateType;
  };
  cameraOption: CameraOptionType;
  controllerOptions?: RuntimeRecord;
};

export type CameraShakeConfig = {
  intensity: number;
  duration: number;
  frequency: number;
  decay: boolean;
};

export type CameraZoomConfig = {
  targetFov: number;
  duration: number;
  easing: (t: number) => number;
}; 

 
