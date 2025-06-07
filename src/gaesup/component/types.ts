import { ObjectMap } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { controllerInnerType, refsType } from '../controller/type';

export type GLTFResult = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.SkinnedMesh };
  materials: { [name: string]: THREE.Material | THREE.MeshStandardMaterial };
} & ObjectMap;

export type passiveRefsType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

export type refsType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

export type controllerInnerType = {
  // Add any necessary properties for the controller
};

export type GaesupComponentProps = {
  props: controllerInnerType;
  refs: refsType;
};
