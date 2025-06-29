import { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
export declare function useGenericRefs(): {
    outerGroupRef: RefObject<THREE.Group<THREE.Object3DEventMap> | null>;
    innerGroupRef: RefObject<THREE.Group<THREE.Object3DEventMap> | null>;
    rigidBodyRef: RefObject<RapierRigidBody | null>;
    colliderRef: RefObject<RapierCollider | null>;
};
