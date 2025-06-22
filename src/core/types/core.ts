import * as THREE from 'three';

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

export type ActiveStateType = ActiveState;
export type GameStatesType = GameStates;
export type ResourceUrlsType = {
  characterUrl: string;
  vehicleUrl: string;
  airplaneUrl: string;
  wheelUrl: string;
  ridingUrl: string;
};

export interface CameraCollisionConfig {
  rayCount: number;
  sphereCastRadius: number;
  minDistance: number;
  maxDistance: number;
  avoidanceSmoothing: number;
  transparentLayers: number[];
}
