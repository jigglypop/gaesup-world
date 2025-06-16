import { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import { RefObject, useRef } from 'react';
import * as THREE from 'three';

export function useGenericRefs() {
  const outerGroupRef: RefObject<THREE.Group | null> = useRef(null);
  const innerGroupRef: RefObject<THREE.Group | null> = useRef(null);
  const rigidBodyRef: RefObject<RapierRigidBody | null> = useRef(null);
  const colliderRef: RefObject<RapierCollider | null> = useRef(null);
  return {
    outerGroupRef,
    innerGroupRef,
    rigidBodyRef,
    colliderRef,
  };
}
