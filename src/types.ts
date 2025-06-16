import { Ray, RayColliderHit } from '@dimforge/rapier3d-compat';
import { RootState } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { CSSProperties, RefObject } from 'react';
import * as THREE from 'three';

export * from './gaesup/types/core';

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

export type RayType = {
  origin: THREE.Vector3;
  hit: RayColliderHit | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  current?: THREE.Vector3;
  angle?: number;
  parent?: RapierRigidBody | null | undefined;
};

export type SlopeRayType = Omit<RayType, 'parent'>;
export type GroundRayType = Omit<RayType, 'current' | 'angle'>;

export type AnimationTagType = {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  jumpIdle: string;
  jumpLand: string;
  fall: string;
  ride: string;
  land: string;
  sit: string;
};

export type ActionsType = AnimationTagType & {
  [key: string]: string;
};

export type AnimationAtomType = {
  tag: string;
  condition: () => boolean;
  action?: () => void;
  animationName?: string;
  key?: string;
};

export type AnimationStatePropType = {
  current: string;
  animationNames?: ActionsType;
  keyControl?: KeyboardControlState;
  store: { [key: string]: AnimationAtomType };
  default: string;
};

export type AnimationStateType = {
  [key: string]: AnimationStatePropType;
};

export type ClickerType = {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
};

export type QueueActionType = 'stop';

export type QueueFunctionType = {
  action: QueueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

export type QueueItemType = THREE.Vector3 | QueueFunctionType;
export type QueueType = QueueItemType[];

export type WheelStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

export type WheelsStateType = {
  0?: WheelStateType;
  1?: WheelStateType;
  2?: WheelStateType;
  3?: WheelStateType;
};

export type PortalType = {
  text?: string;
  position: THREE.Vector3;
  teleportStyle?: CSSProperties;
};

export type PortalsType = PortalType[];

export type JumpInnerType = {
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
};

export type JumpConstType = {
  speed: number;
  gravity: number;
};

export type JumpPropType = JumpInnerType & JumpConstType;

export interface PhysicsInputRef {
  current: {
    keyboard: KeyboardInputState;
    mouse: MouseInputState;
  } | null;
}

export interface PhysicsBridgeInputData {
  inputSystem: {
    keyboard: KeyboardInputState;
    mouse: MouseInputState;
  };
  urls: ResourceUrlsType;
  block: BlockState;
  worldContext: unknown;
  controllerContext: unknown;
  dispatch: DispatchType<unknown>;
  setKeyboardInput: (update: Partial<KeyboardInputState>) => void;
  setMouseInput: (update: Partial<MouseInputState>) => void;
  getSizesByUrls: () => SizesType;
}

export interface PhysicsBridgeData {
  worldContext: unknown;
  activeState: ActiveStateType;
  input: {
    keyboard: KeyboardInputState;
    mouse: MouseInputState;
  } | null;
  urls: ResourceUrlsType;
  blockControl: boolean;
  dispatch: DispatchType<unknown>;
  setKeyboardInput: (update: Partial<KeyboardInputState>) => void;
  setMouseInput: (update: Partial<MouseInputState>) => void;
  getSizesByUrls: () => SizesType;
}

export interface PhysicsBridgeOutput {
  bridgeRef: RefObject<PhysicsBridgeData>;
  isReady: boolean;
  error: string | null;
}

export type CameraOptionType = {
  offset: THREE.Vector3;
  maxDistance: number;
  distance: number;
  xDistance: number;
  yDistance: number;
  zDistance: number;
  zoom: number;
  target: THREE.Vector3;
  position: THREE.Vector3;
  focus: boolean;
  enableCollision: boolean;
  collisionMargin: number;
  smoothing: {
    rotation: number;
    fov: number;
    position: number;
  };
  fov: number;
  minFov: number;
  maxFov: number;
  bounds: {
    minY: number;
    maxY: number;
  };
  modeSettings?: {
    [key: string]: any;
  };
  shoulderOffset?: THREE.Vector3;
  fixedPosition?: THREE.Vector3;
  isoAngle?: number;
  rotation?: THREE.Euler;
  mode?: 'fixed' | 'orbital' | 'smart' | 'follow';
  followCharacterRotation?: boolean;
  worldOffsetX?: number;
  worldOffsetZ?: number;
};

export type RideableType = {
  objectkey: string;
  // ... existing code ...
};
