import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import { controllerInnerType, controllerType } from "../../controller/type";
export declare const AirplaneRigidBody: import("react").ForwardRefExoticComponent<{
    props: controllerInnerType;
    children: ReactNode;
} & import("react").RefAttributes<RapierRigidBody>>;
export declare const AirplaneCollider: import("react").ForwardRefExoticComponent<{
    prop: controllerInnerType;
} & import("react").RefAttributes<Collider>>;
export declare const AirplaneGroup: import("react").ForwardRefExoticComponent<{
    props: controllerType;
    children: ReactNode;
} & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
