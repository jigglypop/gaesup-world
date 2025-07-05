import * as THREE from 'three';
import {
  ComponentType,
  ReactNode,
  RefObject
} from 'react';
import {
  CollisionEnterPayload,
  CollisionExitPayload,
  RapierCollider,
  RapierRigidBody,
  RigidBodyProps,
  RigidBodyTypeString
} from '@react-three/rapier';

export type ModelRendererProps = {
  nodes: Record < string, THREE.Object3D > ;
  color ? : string;
  skeleton: THREE.Skeleton;
  url: string;
  offset ? : THREE.Vector3;
}

export type PartsGroupRefProps = {
  url: string;
  isActive: boolean;
  componentType: ComponentType;
  currentAnimation ? : string;
  color ? : string;
  skeleton ? : THREE.Skeleton | null;
}

export type riderRefType = {
  url: string;
  children ? : React.ReactNode;
  offset ? : THREE.Vector3;
}

export type InnerGroupRefType = {
  children ? : React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: RefObject < THREE.Object3D > ;
  nodes: Record < string, THREE.Object3D > ;
  url ? : string;
  skeleton ? : THREE.Skeleton | null;
  isActive ? : boolean;
  ridingUrl ? : string;
  offset ? : THREE.Vector3;
  parts ? : Part;
  isRiderOn ? : boolean;
  enableRiding ? : boolean;
}

export type Part = {
  url: string;
  color ? : string;
}

export type GroundRay = {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  length: number;
  dir ? : THREE.Vector3;
}

export type PhysicsEntityProps = {
  onReady ? : () => void;
  onFrame ? : () => void;
  onDestory ? : () => void;
  onAnimate ? : () => void;
  url: string;
  name ? : string;
  position ? : THREE.Vector3 | [number, number, number];
  rotation ? : THREE.Euler | [number, number, number];
  size?: { x: number; y: number; z: number };
  isActive: boolean;
  componentType: ComponentType;
  rigidbodyType ? : RigidBodyTypeString;
  groundRay ? : GroundRay;
  rigidBodyProps ? : RigidBodyProps;
  parts ? : Part[];
  rigidBodyRef ? : RefObject < RapierRigidBody > ;
  colliderRef ? : RefObject < RapierCollider > ;
  outerGroupRef ? : RefObject < THREE.Group > ;
  innerGroupRef ? : RefObject < THREE.Group > ;
  children ? : ReactNode;
  userData ? : Record < string, unknown > ;
  sensor ? : boolean;
  onIntersectionEnter ? : (payload: CollisionEnterPayload) => void;
  onIntersectionExit ? : (payload: CollisionExitPayload) => void;
  onCollisionEnter ? : (payload: CollisionEnterPayload) => void;
  isNotColliding ? : boolean;
  isRiderOn ? : boolean;
  enableRiding ? : boolean;
  ridingUrl ? : string;
  offset ? : THREE.Vector3;
  currentAnimation ? : string;
  controllerOptions ? : {
    lerp: {
      cameraTurn: number;
      cameraPosition: number;
    };
  };
}

export type SetGroundRayType = {
  groundRay: GroundRay;
  length: number;
  colliderRef: React.RefObject < RapierCollider > ;
  onGround ? : boolean;
  onAir ? : boolean;
  dir ? : THREE.Vector3;
}

// New types for refactoring
export type EntityProps = PhysicsEntityProps & {
  // Props specific to the dumb component
};

export type EntityControllerProps = Omit < PhysicsEntityProps, 'rigidBodyRef' | 'colliderRef' | 'outerGroupRef' | 'innerGroupRef' > ;
