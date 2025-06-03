import { RigidBodyProps } from '@react-three/rapier';
import * as THREE from 'three';
import { controllerOptionsType, GroundRayType } from '../../controller/type';

export type rideablePropType = {
  groundRay?: GroundRayType;
  objectkey: string;
  objectType?: 'vehicle' | 'airplane';
  controllerOptions: controllerOptionsType;
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
};
