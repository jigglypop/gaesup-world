import { Collider } from '@dimforge/rapier3d-compat';
import { RigidBodyProps, RigidBodyTypeString } from '@react-three/rapier';
import { MutableRefObject, RefObject } from 'react';
import * as THREE from 'three';
import { callbackType } from '../../../physics/world/types';
import { GroundRayType, PartsType } from '../../../physics/world/types';
import { ResourceUrlsType } from '../../../../atoms';
import { innerRefType, passivePropsType } from '../../../passive/types';
// collider 정의
export type characterColliderType = {
  height: number;
  halfHeight: number;
  radius: number;
  diameter: number;
};
// innerGroupRef 타입정의
export type InnerGroupRefType = {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
  nodes: {
    [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
  };
  isActive?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  parts?: PartsType;
} & ridingType;
// riding 타입정의
export type ridingType = {
  isRiderOn?: boolean;
  enableRiding?: boolean;
};

export type refPropsType = {
  children: React.ReactNode;
  urls: ResourceUrlsType;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  offset?: THREE.Vector3;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  currentAnimation?: string;
  type?: RigidBodyTypeString;
};

export type setGroundRayType = {
  groundRay: GroundRayType;
  length: number;
  colliderRef: RefObject<Collider>;
};

export type rigidBodyRefType = {
  name?: string;
  isActive?: boolean;
  ridingUrl?: string;
  groundRay?: GroundRayType;
  rigidBodyProps?: RigidBodyProps;
  isNotColliding?: boolean;
  parts?: PartsType;
} & passivePropsType &
  innerRefType &
  callbackType;

export type GenericRefsType = {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  outerGroupRef: MutableRefObject<THREE.Group | null>;
  innerGroupRef: MutableRefObject<THREE.Group | null>;
  colliderRef: MutableRefObject<Collider | null>;
};

export type PartsGroupRefProps = {
  url: string;
  isActive: boolean;
  componentType: componentTypeString;
  currentAnimation: string;
  color?: string;
  skeleton?: THREE.Skeleton;
};

export type OuterGroupRefProps = {
  children: React.ReactNode;
};
