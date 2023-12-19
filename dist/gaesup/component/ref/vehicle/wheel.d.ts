import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
export type wheelRegidBodyType = {
    wheelPosition: [number, number, number];
    bodyRef: RefObject<RapierRigidBody>;
    wheel: RefObject<RapierRigidBody>;
    bodyAnchor: THREE.Vector3Tuple;
    wheelAnchor: THREE.Vector3Tuple;
    rotationAxis: THREE.Vector3Tuple;
};
export declare const WheelRegidBodyRef: import("react").ForwardRefExoticComponent<wheelRegidBodyType & import("react").RefAttributes<RapierRigidBody>>;
