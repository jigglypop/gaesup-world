import { GroupProps } from '@react-three/fiber';
import { Dispatch } from 'react';
import * as THREE from 'three';

// Context types (moved from context/types.ts)
export type animationPropType = {
  current: string;
  animationNames: any;
  keyControl: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
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

export type gaesupWorldContextType = {
  activeState?: any;
  mode?: any;
  urls?: any;
  states?: any;
  control?: any;
  refs?: any;
  animationState?: any;
  clickerOption?: any;
  clicker?: any;
  rideable?: { [key: string]: any };
  sizes?: any;
  block?: any;
  airplane?: airplaneType;
  vehicle?: vehicleType;
  character?: characterType;
  callbacks?: any;
  controllerOptions?: {
    lerp: {
      cameraTurn: number;
      cameraPosition: number;
    };
  };
};

export type gaesupDisptachType = Dispatch<{
  type: string;
  payload?: Partial<gaesupWorldContextType>;
}>;

export type AnimationAtomType = {
  current: string;
  default: string;
  store: Record<string, any>;
};

export interface ActiveState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  dir: THREE.Vector3;
  direction: THREE.Vector3;
}

export interface ModeState {
  type: 'character' | 'vehicle' | 'airplane';
  controller: 'clicker' | 'keyboard' | 'joystick' | 'gamepad';
  control: 'chase' | 'firstPerson' | 'topDown';
}

export interface UrlsState {
  characterUrl: string | null;
  vehicleUrl: string | null;
  airplaneUrl: string | null;
  wheelUrl: string | null;
  ridingUrl: string | null;
}

export interface GameStates {
  rideableId: string | null;
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
  nearbyRideable: {
    objectkey: string;
    objectType: 'vehicle' | 'airplane';
    name: string;
  } | null;
  shouldEnterRideable: boolean;
  shouldExitRideable: boolean;
}

export interface AnimationState {
  character: {
    current: string;
    default: string;
    store: Record<string, AnimationAtomType>;
  };
  vehicle: {
    current: string;
    default: string;
    store: Record<string, AnimationAtomType>;
  };
  airplane: {
    current: string;
    default: string;
    store: Record<string, AnimationAtomType>;
  };
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
