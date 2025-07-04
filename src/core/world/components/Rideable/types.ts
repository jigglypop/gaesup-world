import * as THREE from 'three';
import { RigidBodyProps } from '@react-three/rapier';
import { WorldObject } from '../../core/WorldEngine';

export interface GameStatesType {
      //   canRide: false,
      // isRiding: false,
      // isJumping: false,
      // isFalling: false,
      // isMoving: false,
      // isRunning: false,
      // isNotMoving: true,
      // isNotRunning: true,
      // isOnTheGround: true,
      // nearbyRideable: undefined,
      // currentRideable: undefined,
      // rideableDistance: undefined,
    
    canRide: boolean;
    isRiding: boolean;
    isJumping: boolean;
    isFalling: boolean;
    isMoving: boolean;
    isRunning: boolean;
    isNotMoving: boolean;
    isNotRunning: boolean;
    isOnTheGround: boolean;
    nearbyRideable?: RideableObject | undefined;
    currentRideable?: RideableObject | undefined;
    rideableDistance?: number | undefined;
}

export interface GameStates {
  canRide: boolean;
  isRiding: boolean;
  nearbyRideable?: RideableObject;
  currentRideable?: RideableObject;
  rideableDistance?: number;
}

export interface NearbyRideable {
  id: string;
  distance: number;
  object: RideableObject;
  canInteract: boolean;
}

export interface RideableObject extends WorldObject {
  type: 'rideable';
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  isOccupied: boolean;
  occupant?: string;
  rideMessage?: string;
  exitMessage?: string;
  controls: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    brake: boolean;
  };
  physics?: {
    mass: number;
    friction: number;
    restitution: number;
    linearDamping: number;
    angularDamping: number;
  };
}

export interface RideableUIProps {
  states: {
    canRide: boolean;
    isRiding: boolean;
    nearbyRideable?: RideableObject;
    currentRideable?: RideableObject;
  };
}

export interface RideablePropType {
  objectkey: string;
  objectType?: 'vehicle' | 'airplane' | 'boat' | 'bike';
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  characterUrl?: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  offset?: THREE.Vector3;
  maxSpeed?: number;
  acceleration?: number;
  rideMessage?: string;
  exitMessage?: string;
  displayName?: string;
  controllerOptions?: {
    lerp?: {
      cameraPosition?: number;
      cameraTurn?: number;
    };
  };
  onRide?: (objectId: string) => void;
  onExit?: (objectId: string) => void;
  physics?: RigidBodyProps;
}

export interface RideableState {
  currentSpeed: number;
  targetSpeed: number;
  steering: number;
  isAccelerating: boolean;
  isBraking: boolean;
  fuel?: number;
  maxFuel?: number;
  durability?: number;
  maxDurability?: number;
}

export interface RideableControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost?: boolean;
  horn?: boolean;
}

export interface RideableEvents {
  onMount: (objectId: string, riderId: string) => void;
  onDismount: (objectId: string, riderId: string) => void;
  onSpeedChange: (objectId: string, speed: number) => void;
  onCollision: (objectId: string, collisionData: any) => void;
  onFuelEmpty?: (objectId: string) => void;
  onDamage?: (objectId: string, damage: number) => void;
}
