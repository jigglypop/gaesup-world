import { MutableRefObject, useRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Collider } from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export type GenericRefsType = {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  outerGroupRef: MutableRefObject<THREE.Group | null>;
  innerGroupRef: MutableRefObject<THREE.Group | null>;
  colliderRef: MutableRefObject<Collider | null>;
};

export function useGenericRefs(): GenericRefsType {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);
  return { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef };
}
