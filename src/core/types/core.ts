import { GroupProps } from '@react-three/fiber';
import { Dispatch } from 'react';
import * as THREE from 'three';
import type { RefObject } from 'react';
import type { RapierRigidBody, RapierCollider } from '@react-three/rapier';

export type AnimationPropType = {
  current: string;
  animationNames: string;
  keyControl: {
    [key: string]: boolean;
  };
  store: Record<string, THREE.AnimationAction>;
  default: string;
  timestamp: number;
  data: Record<string, unknown>;
};

export type airplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};

export type vehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

export type characterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
  jumpGravityScale?: number;
  normalGravityScale?: number;
  airDamping?: number;
  stopDamping?: number;
};

export interface airplaneType extends GroupProps, airplaneDebugType {}
export interface vehicleType extends GroupProps, vehicleDebugType {}
export interface characterType extends GroupProps, characterDebugType {}

export interface ActiveState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  dir: THREE.Vector3;
  direction: THREE.Vector3;
}

export interface GameStates {
  rideableId: string;
  isMoving: boolean;
  isNotMoving: boolean;
  isOnTheGround: boolean;
  isOnMoving: boolean;
  isRotated: boolean;
  isRunning: boolean;
  isJumping: boolean;
  enableRiding: boolean;
  isRiderOn: boolean;
  isLanding: boolean;
  isFalling: boolean;
  isRiding: boolean;
  canRide: boolean;
  nearbyRideable: THREE.Object3D | null;
  shouldEnterRideable: boolean;
  shouldExitRideable: boolean;
}

export interface ControllerRefs {
  rigidBodyRef?: RefObject<RapierRigidBody>;
  colliderRef?: RefObject<RapierCollider>;
  outerGroupRef?: RefObject<THREE.Group>;
  innerGroupRef?: RefObject<THREE.Group>;
  animationRef?: RefObject<THREE.Group>;
}

export interface AnimationState {
  current: string;
  default: string;
  store: Record<string, THREE.AnimationAction>;
}

export interface EntityAnimationStates {
  character: AnimationState;
  vehicle: AnimationState;
  airplane: AnimationState;
}

export interface EntityCallbacks {
  onReady?: () => void;
  onFrame?: () => void;
  onDestory?: () => void;
  onAnimate?: () => void;
}

export interface ControllerOptions {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export type gaesupWorldContextType = {
  activeState?: ActiveStateType;
  mode?: ModeType;
  urls?: ResourceUrlsType;
  states?: GameStatesType;
  control?: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
  };
  refs?: ControllerRefs;
  animationState?: EntityAnimationStates;
  clickerOption?: {
    isRun: boolean;
    track?: boolean;
    queue?: Array<
      THREE.Vector3 | { action: string; beforeCB: () => void; afterCB: () => void; time: number }
    >;
    loop?: boolean;
  };
  clicker?: {
    point: THREE.Vector3;
    angle: number;
    isOn: boolean;
    isRun: boolean;
  };
  rideable?: { [key: string]: THREE.Object3D };
  sizes?: { [key: string]: THREE.Vector3 };
  block?: {
    camera: boolean;
    control: boolean;
    animation: boolean;
    scroll: boolean;
  };
  airplane?: airplaneType;
  vehicle?: vehicleType;
  character?: characterType;
  callbacks?: EntityCallbacks;
  controllerOptions?: ControllerOptions;
};

export type gaesupDisptachType = Dispatch<{
  type: string;
  payload?: Partial<gaesupWorldContextType>;
}>;

export interface ModeState {
  type: 'character' | 'vehicle' | 'airplane';
  controller: 'clicker' | 'keyboard' | 'joystick' | 'gamepad';
  control:
    | 'chase'
    | 'firstPerson'
    | 'topDown'
    | 'thirdPerson'
    | 'fixed'
    | 'isometric'
    | 'sideScroll';
}

export type rideableState = Record<
  string,
  {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    velocity: THREE.Vector3;
    isOccupied: boolean;
    objectType: 'vehicle' | 'airplane';
  }
>;

export interface ControllerConfig {
  airplane: {
    angleDelta: THREE.Vector3;
    maxAngle: THREE.Vector3;
    maxSpeed: number;
    accelRatio: number;
    brakeRatio: number;
    buoyancy: number;
    linearDamping: number;
  };
  vehicle: {
    maxSpeed: number;
    accelRatio: number;
    brakeRatio: number;
    wheelOffset: number;
    linearDamping: number;
  };
  character: {
    walkSpeed: number;
    runSpeed: number;
    turnSpeed: number;
    jumpSpeed: number;
    linearDamping: number;
    jumpGravityScale: number;
    normalGravityScale: number;
    airDamping: number;
    stopDamping: number;
  };
  controllerOptions: {
    lerp: {
      cameraTurn: number;
      cameraPosition: number;
    };
  };
}

export type EventType =
  | 'POSITION_CHANGED'
  | 'MODE_CHANGED'
  | 'RIDEABLE_ENTER'
  | 'RIDEABLE_EXIT'
  | 'ANIMATION_CHANGE'
  | 'PHYSICS_UPDATE'
  | 'COLLISION_DETECTED';

export interface EventPayload {
  type: EventType;
  data: Record<string, unknown>;
  timestamp: number;
}

export type ActiveStateType = ActiveState;
export type ModeType = ModeState;
export type GameStatesType = GameStates;
export type ResourceUrlsType = {
  characterUrl: string;
  vehicleUrl: string;
  airplaneUrl: string;
  wheelUrl: string;
  ridingUrl: string;
};

export interface CameraOptionType {
  offset?: THREE.Vector3;
  maxDistance?: number;
  distance?: number;
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  zoom?: number;
  target?: THREE.Vector3;
  position?: THREE.Vector3;
  focus?: boolean;
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
  bounds?: {
    minY?: number;
    maxY?: number;
  };
  mode?: string;
  fixedPosition?: THREE.Vector3;
  rotation?: THREE.Euler;
  isoAngle?: number;
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

export interface CameraCollisionConfig {
  rayCount: number;
  sphereCastRadius: number;
  minDistance: number;
  maxDistance: number;
  avoidanceSmoothing: number;
  transparentLayers: number[];
}
