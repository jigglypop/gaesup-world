import { Collider } from '@dimforge/rapier3d-compat';
import {
  CollisionEnterPayload,
  CollisionExitPayload,
  RapierRigidBody,
  RigidBodyProps,
  RigidBodyTypeString,
} from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { controllerOptionsType, groundRayType, partsType } from '../../controller/type';
import { ridingType } from '../inner/common/types';

export type componentTypeString = 'character' | 'vehicle' | 'airplane';
export type innerRefType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};
export type passivePropsType = {
  children?: React.ReactNode;
  groundRay?: groundRayType;
  url: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  controllerOptions?: controllerOptionsType;
  currentAnimation?: string;
  rigidbodyType?: RigidBodyTypeString;
  sensor?: boolean;
  onIntersectionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  onIntersectionExit?: (e: CollisionExitPayload) => Promise<void>;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  componentType: componentTypeString;
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
  parts?: partsType;
  isNotColliding?: boolean;
  isRiderOn?: boolean;
  enableRiding?: boolean;
} & ridingType;

export type PassiveRideableProps<T extends 'vehicle' | 'airplane'> = passivePropsType & {
  componentType: T;
  name?: string;
};
