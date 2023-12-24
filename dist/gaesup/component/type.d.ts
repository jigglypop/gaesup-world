import { ObjectMap } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import { GLTF } from "three-stdlib";
export type GLTFResult = GLTF & {
    nodes: {
        [name: string]: THREE.Mesh | THREE.SkinnedMesh;
    };
    materials: {
        [name: string]: THREE.Material | THREE.MeshStandardMaterial;
    };
} & ObjectMap;
export type passiveRefsType = {
    rigidBodyRef: RefObject<RapierRigidBody>;
    outerGroupRef: RefObject<THREE.Group>;
    innerGroupRef: RefObject<THREE.Group>;
    characterInnerRef: RefObject<THREE.Group>;
};
