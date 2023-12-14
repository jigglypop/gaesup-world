import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import { controllerType, groundRayType, propType, slopeRayType } from "../../controller/type";
export declare const CharacterRigidBody: import("react").ForwardRefExoticComponent<{
    controllerProps: propType;
    children: ReactNode;
} & import("react").RefAttributes<RapierRigidBody>>;
export declare const CharacterCapsuleCollider: import("react").ForwardRefExoticComponent<{
    prop: propType;
} & import("react").RefAttributes<Collider>>;
export declare const CharacterGroup: import("react").ForwardRefExoticComponent<{
    controllerProps: controllerType;
    children: ReactNode;
} & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
export declare const CharacterSlopeRay: import("react").ForwardRefExoticComponent<{
    groundRay: groundRayType;
    slopeRay: slopeRayType;
} & import("react").RefAttributes<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>>>;
