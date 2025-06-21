import { RigidBodyProps } from '@react-three/rapier';
import * as THREE from 'three';
import { ControllerOptionsType, GroundRayType } from '../../controller/type';
import { GameStatesType } from '../../types';

export interface RideableUIProps {
  states: GameStatesType;
}

export interface RideablePropType {
  groundRay?: GroundRayType;
  objectkey: string;
  objectType?: 'vehicle' | 'airplane';
  controllerOptions: ControllerOptionsType;
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  characterUrl?: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
  rideMessage?: string;
  exitMessage?: string;
  displayName?: string;
}

// Legacy export for compatibility
export type rideablePropType = RideablePropType;
