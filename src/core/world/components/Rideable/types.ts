import { RigidBodyProps } from '@react-three/rapier';
import * as THREE from 'three';

import { CollisionEvent } from '@core/types/common';


export type GameStatesType = {
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

export type GameStates = {
  canRide: boolean;
  isRiding: boolean;
  nearbyRideable?: RideableObject;
  currentRideable?: RideableObject;
  rideableDistance?: number;
}

export type NearbyRideable = {
  id: string;
  distance: number;
  object: RideableObject;
  canInteract: boolean;
}

export type RideableObject = {
  id: string;
  type: 'rideable';
  objectkey: string;
  objectType: 'vehicle' | 'airplane' | 'boat' | 'bike';
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  name?: string;
  displayName?: string;
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
};

export type RideableUIProps = {
  states: {
    canRide: boolean;
    isRiding: boolean;
    nearbyRideable?: RideableObject;
    currentRideable?: RideableObject;
  };
}

export type RideablePropType = {
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

export type RideableState = {
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

export type RideableControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost?: boolean;
  horn?: boolean;
}

export type RideableEvents = {
  onMount: (objectId: string, riderId: string) => void;
  onDismount: (objectId: string, riderId: string) => void;
  onSpeedChange: (objectId: string, speed: number) => void;
  onCollision: (objectId: string, collisionData: CollisionEvent) => void;
  onFuelEmpty?: (objectId: string) => void;
  onDamage?: (objectId: string, damage: number) => void;
}
