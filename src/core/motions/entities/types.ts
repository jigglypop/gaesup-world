import { RigidBodyProps, RigidBodyTypeString } from '@react-three/rapier';
import * as THREE from 'three';
import { RapierCollider, CollisionPayload } from '@react-three/rapier';
import { controllerInnerType, GroundRayType } from '../../component/types';
import { ComponentType, ReactNode, RefObject } from 'react';
import { BaseCallbacks, BaseRefs, Position3D, Rotation3D } from '../../../types/common';

export interface Part {
  url: string;
  color?: string;
}

export interface GroundRay {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  length: number;
}

export interface SetGroundRay {
  groundRay: GroundRay;
  length: number;
  colliderRef: RefObject<RapierCollider>;
}

export interface InnerGroupRef {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: RefObject<THREE.Object3D>;
  nodes: Record<string, THREE.Object3D>;
  url?: string;
  skeleton?: THREE.Skeleton | null;
  isActive?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  parts?: Part;
  isRiderOn?: boolean;
  enableRiding?: boolean;
}

export interface PhysicsEntityProps extends BaseCallbacks {
  onReady?: () => void;
  onFrame?: () => void;
  onDestory?: () => void;
  onAnimate?: () => void;
  url: string;
  name?: string;
  position?: Position3D;
  rotation?: Rotation3D;
  isActive: boolean;
  componentType: ComponentType;
  rigidbodyType?: RigidBodyTypeString;
  groundRay?: THREE.Ray;
  rigidBodyProps?: RigidBodyProps;
  parts?: Part[];
  refs: BaseRefs;
  children?: ReactNode;
  userData?: Record<string, unknown>;
  sensor?: boolean;
  onIntersectionEnter?: (payload: CollisionPayload) => void;
  onIntersectionExit?: (payload: CollisionPayload) => void;
  onCollisionEnter?: (payload: CollisionPayload) => void;
  isNotColliding?: boolean;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  currentAnimation?: string;
}

export interface ModelRendererProps {
  nodes: Record<string, THREE.Object3D>;
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

export interface RiderRef {
  url: string;
  children?: React.ReactNode;
  offset?: THREE.Vector3;
}

export interface EntityControllerProps {
  props: unknown;
  children?: React.ReactNode;
}
