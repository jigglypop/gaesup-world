import { useRef } from 'react';

import { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export function useGenericRefs() {
  const outerGroupRef = useRef<THREE.Group>(null!);
  const innerGroupRef = useRef<THREE.Group>(null!);
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const colliderRef = useRef<RapierCollider>(null!);
  return {
    outerGroupRef,
    innerGroupRef,
    rigidBodyRef,
    colliderRef,
  };
}
