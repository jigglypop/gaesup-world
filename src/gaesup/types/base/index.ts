import * as THREE from 'three';
import { Dispatch, RefObject } from 'react';
import { ObjectMap } from '@react-three/fiber';
import { Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { GLTF } from 'three-stdlib';

export type DispatchType<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

export type ComponentTypeString = 'character' | 'vehicle' | 'airplane';

export type GLTFResultType = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.SkinnedMesh };
  materials: { [name: string]: THREE.Material | THREE.MeshStandardMaterial };
} & ObjectMap;

export type RefsType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  characterInnerRef?: RefObject<THREE.Group>;
  passiveRigidBodyRef?: RefObject<RapierRigidBody>;
};

export type KeyControlType = Record<string, boolean>;
export type UrlsType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

export type BlockType = {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
};
