import { RigidBodyTypeString } from '@react-three/rapier';
import * as THREE from 'three';
import { RapierCollider } from '@react-three/rapier';
import { controllerInnerType, GroundRayType } from '../../component/types';
import { ComponentType, ReactNode, RefObject } from 'react';

export type PartsType = {
  url: string;
  color?: string;
};

export type setGroundRayType = {
  groundRay: GroundRayType;
  length: number;
  colliderRef: RefObject<RapierCollider>;
};

export type InnerGroupRefType = {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: RefObject<THREE.Object3D<THREE.Object3DEventMap>>;
  nodes: {
    [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
  };
  url?: string;
  skeleton?: THREE.Skeleton | null;
  isActive?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  parts?: PartsType;
  isRiderOn?: boolean;
  enableRiding?: boolean;
};

export interface PhysicsEntityProps {
  url: string;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  isActive: boolean;
  componentType: ComponentType;
  rigidbodyType?: RigidBodyTypeString;
  groundRay?: THREE.Ray;
  onAnimate?: () => void;
  onFrame?: () => void;
  onReady?: () => void;
  onDestory?: () => void;
  rigidBodyProps?: any;
  parts?: Array<{ url: string; color?: string }>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  colliderRef: RefObject<RapierCollider>;
  children?: ReactNode;
  userData?: any;
  sensor?: boolean;
  onIntersectionEnter?: (payload: any) => Promise<void> | void;
  onIntersectionExit?: (payload: any) => Promise<void> | void;
  onCollisionEnter?: (payload: any) => Promise<void> | void;
  isNotColliding?: boolean;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  currentAnimation?: string;
}

export interface ModelRendererProps {
  nodes: { [name: string]: THREE.Object3D };
  color?: string;
  skeleton?: THREE.Skeleton | null;
  url: string;
  offset?: THREE.Vector3;
}

export interface PartsGroupRefProps {
  url: string;
  isActive: boolean;
  componentType: ComponentType;
  currentAnimation?: string;
  color?: string;
  skeleton?: THREE.Skeleton | null;
}

export interface riderRefType {
  url: string;
  children?: React.ReactNode;
  offset?: THREE.Vector3;
}

export interface EntityControllerProps {
  props: controllerInnerType;
  children?: React.ReactNode;
}
