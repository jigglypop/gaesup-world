import { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import { MutableRefObject, useRef } from 'react';
import * as THREE from 'three';

export function useGenericRefs() {
  const outerGroupRef: MutableRefObject<THREE.Group> = useRef() as MutableRefObject<THREE.Group>;
  const innerGroupRef: MutableRefObject<THREE.Group> = useRef() as MutableRefObject<THREE.Group>;
  const rigidBodyRef: MutableRefObject<RapierRigidBody> =
    useRef() as MutableRefObject<RapierRigidBody>;
  const colliderRef: MutableRefObject<RapierCollider> =
    useRef() as MutableRefObject<RapierCollider>;

  return {
    outerGroupRef,
    innerGroupRef,
    rigidBodyRef,
    colliderRef,
  };
}
