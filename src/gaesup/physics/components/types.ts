import { RigidBodyTypeString } from '@react-three/rapier';
import { MutableRefObject, ReactNode } from 'react';
import * as THREE from 'three';
import { RapierCollider } from '@react-three/rapier';
import { controllerOptionsType } from '../../component/controller/type';
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
  onIntersectionEnter?: (payload: any) => void;
  onIntersectionExit?: (payload: any) => void;
  onCollisionEnter?: (payload: any) => void;
  isNotColliding?: boolean;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  currentAnimation?: string;
}
