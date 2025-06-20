import * as THREE from 'three';
import type { RefObject } from 'react';
import type { RapierRigidBody, RapierCollider } from '@react-three/rapier';

export interface ActiveState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  dir: THREE.Vector3;
  direction: THREE.Vector3;
}

export interface NearbyRideable {
  objectkey: string;
  objectType: 'vehicle' | 'airplane';
  name: string;
  rideMessage?: string;
  exitMessage?: string;
  displayName?: string;
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
  nearbyRideable: NearbyRideable | null;
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

export type ActiveStateType = ActiveState;
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
