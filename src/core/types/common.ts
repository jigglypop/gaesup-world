import * as THREE from 'three';
import { Dispatch, RefObject } from 'react';
import { RapierRigidBody, RapierCollider } from '@react-three/rapier';

export type Vector3Tuple = [number, number, number];
export type EulerTuple = [number, number, number];
export type QuaternionTuple = [number, number, number, number];
export type Position3D = THREE.Vector3 | Vector3Tuple;
export type Rotation3D = THREE.Euler | EulerTuple;
export type Quaternion3D = THREE.Quaternion | QuaternionTuple;

export interface BaseEntity {
  id: string;
  name?: string;
  position: Position3D;
  rotation?: Rotation3D;
  scale?: Position3D;
}

export interface BaseController<T = Record<string, boolean>> {
  input: T;
  isActive: boolean;
  timestamp: number;
}

export interface BaseRefs {
  rigidBodyRef?: RefObject<RapierRigidBody>;
  colliderRef?: RefObject<RapierCollider>;
  outerGroupRef?: RefObject<THREE.Group>;
  innerGroupRef?: RefObject<THREE.Group>;
}

export interface BaseCallbacks {
  onReady?: () => void;
  onFrame?: (delta: number) => void;
  onDestroy?: () => void;
  onUpdate?: (data: unknown) => void;
}

export interface BaseState<T = unknown> {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  data: T;
}

export interface BaseConfig<T = unknown> {
  enabled: boolean;
  debug?: boolean;
  options?: T;
}

export interface BaseEventPayload<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  source?: string;
}

export type BaseDispatch<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

export interface BaseAnimationState {
  current: string;
  default: string;
  actions: Record<string, THREE.AnimationAction>;
  mixer?: THREE.AnimationMixer;
}

export interface BasePhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  isOnGround: boolean;
  isMoving: boolean;
}
