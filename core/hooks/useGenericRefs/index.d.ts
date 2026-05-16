import { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
export declare function useGenericRefs(): {
    outerGroupRef: import("react").RefObject<THREE.Group<THREE.Object3DEventMap>>;
    innerGroupRef: import("react").RefObject<THREE.Group<THREE.Object3DEventMap>>;
    rigidBodyRef: import("react").RefObject<RapierRigidBody>;
    colliderRef: import("react").RefObject<RapierCollider>;
};
