import {
  ReactNode,
  RefObject
} from 'react';

import {
  CollisionPayload,
  CollisionEnterPayload,
  RapierCollider,
  RapierRigidBody,
  RigidBodyProps,
  RigidBodyTypeString
} from '@react-three/rapier';
import * as THREE from 'three';

export type Part = {
  url: string;
  color?: string;
};

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
  componentType: string;
  currentAnimation ? : string;
  color ? : string;
  skeleton ? : THREE.Skeleton | null;
}

export type riderRefType = {
  url: string;
  children ? : React.ReactNode;
  offset ? : THREE.Vector3;
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
  scale?: THREE.Vector3 | [number, number, number] | number;
  size?: { x: number; y: number; z: number };
  isActive: boolean;
  componentType: string;
  rigidbodyType ? : RigidBodyTypeString;
  groundRay ? : GroundRay;
  rigidBodyProps ? : RigidBodyProps;
  parts ? : Part[];
  /**
   * Optional tint color applied to the base model materials.
   * Useful when you want per-entity coloring without adding a separate "part" GLTF.
   */
  baseColor?: string;
  /**
   * Hide specific mesh nodes from the base model renderer.
   * Useful when a "part" GLB includes an overlapping mesh (prevents z-fighting/ghosting).
   *
   * The names correspond to glTF node names (e.g. "back", "tee" for the ally assets).
   */
  excludeBaseNodes?: string[];
  rigidBodyRef ? : RefObject < RapierRigidBody > ;
  colliderRef ? : RefObject < RapierCollider > ;
  outerGroupRef ? : RefObject < THREE.Group > ;
  innerGroupRef ? : RefObject < THREE.Group > ;
  children ? : ReactNode;
  userData ? : Record < string, unknown > ;
  sensor ? : boolean;
  onIntersectionEnter ? : (payload: CollisionPayload) => void;
  onIntersectionExit ? : (payload: CollisionPayload) => void;
  onCollisionEnter ? : (payload: CollisionEnterPayload) => void;
  isNotColliding ? : boolean;
  isRiderOn ? : boolean;
  enableRiding ? : boolean;
  ridingUrl ? : string;
  offset ? : THREE.Vector3;
  /**
   * 모델 자체의 전방축이 뒤집혀있는(GLTF 전방 -Z) 경우 보정용 yaw 오프셋
   * - 기본값: componentType === 'character' ? Math.PI : 0 (InnerGroupRef에서 처리)
   */
  modelYawOffset?: number;
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
