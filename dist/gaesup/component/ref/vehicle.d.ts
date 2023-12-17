import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { controllerInnerType, controllerType } from "../../controller/type";
export declare const VehicleRigidBody: import("react").ForwardRefExoticComponent<{
    props: controllerInnerType;
    children: ReactNode;
} & import("react").RefAttributes<RapierRigidBody>>;
export declare const VehicleCollider: import("react").ForwardRefExoticComponent<import("react").RefAttributes<Collider>>;
export declare const VehicleGroup: import("react").ForwardRefExoticComponent<{
    props: controllerType;
    children: ReactNode;
} & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
export type wheelRegidBodyType = {
    wheelPosition: [number, number, number];
    wheelsUrl?: string;
    bodyRef: RefObject<RapierRigidBody>;
    wheel: RefObject<RapierRigidBody>;
    bodyAnchor: THREE.Vector3Tuple;
    wheelAnchor: THREE.Vector3Tuple;
    rotationAxis: THREE.Vector3Tuple;
};
export declare const WheelRegidBodyRef: import("react").ForwardRefExoticComponent<wheelRegidBodyType & import("react").RefAttributes<RapierRigidBody>>;
