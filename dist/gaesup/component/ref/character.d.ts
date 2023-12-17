import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import { controllerInnerType, controllerType, groundRayType, slopeRayType } from "../../controller/type";
export declare const CharacterRigidBody: import("react").ForwardRefExoticComponent<{
    props: controllerInnerType;
    children: ReactNode;
} & import("react").RefAttributes<RapierRigidBody>>;
export declare const CharacterCapsuleCollider: import("react").ForwardRefExoticComponent<{
    props: controllerInnerType;
} & import("react").RefAttributes<Collider>>;
export declare const CharacterGroup: import("react").ForwardRefExoticComponent<{
    props: controllerType;
    children: ReactNode;
} & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
export declare const CharacterSlopeRay: import("react").ForwardRefExoticComponent<{
    groundRay: groundRayType;
    slopeRay: slopeRayType;
} & import("react").RefAttributes<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>>>;
