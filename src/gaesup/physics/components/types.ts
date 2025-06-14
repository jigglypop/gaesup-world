import { RigidBodyTypeString } from '@react-three/rapier';
import { MutableRefObject, ReactNode } from 'react';
import * as THREE from 'three';
import { RapierCollider } from '@react-three/rapier';
import { controllerOptionsType, controllerInnerType } from '../../component/types';
import { ComponentType } from '../../component/types';

export interface PhysicsEntityProps {
  url: string;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  isActive: boolean;
  componentType: ComponentType;
  rigidbodyType?: RigidBodyTypeString;
  controllerOptions?: controllerOptionsType;
  groundRay?: THREE.Ray;
  onAnimate?: () => void;
  onFrame?: () => void;
  onReady?: () => void;
  onDestory?: () => void;
  rigidBodyProps?: any;
  parts?: Array<{ url: string; color?: string }>;
  outerGroupRef: MutableRefObject<THREE.Group>;
  innerGroupRef: MutableRefObject<THREE.Group>;
  colliderRef: MutableRefObject<RapierCollider>;
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
