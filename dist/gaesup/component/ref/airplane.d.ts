import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import { controllerType, propType } from "../../controller/type";
export declare const AirplaneRigidBody: import("react").ForwardRefExoticComponent<{
    controllerProps: propType;
    children: ReactNode;
} & import("react").RefAttributes<RapierRigidBody>>;
export declare const AirplaneCollider: import("react").ForwardRefExoticComponent<{
    prop: propType;
} & import("react").RefAttributes<Collider>>;
export declare const AirplaneGroup: import("react").ForwardRefExoticComponent<{
    controllerProps: controllerType;
    children: ReactNode;
} & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
