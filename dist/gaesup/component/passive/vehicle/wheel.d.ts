import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import { vehicleColliderType } from "../../../world/context/type";
export type wheelRegidBodyType = {
    wheelPosition: [number, number, number];
    bodyRef: RefObject<RapierRigidBody>;
    wheel: RefObject<RapierRigidBody>;
    bodyAnchor: THREE.Vector3Tuple;
    wheelAnchor: THREE.Vector3Tuple;
    rotationAxis: THREE.Vector3Tuple;
    vehicleCollider: vehicleColliderType;
    url: string;
};
export declare const WheelRegidBodyRef: import("react").ForwardRefExoticComponent<{
    props: wheelRegidBodyType;
} & import("react").RefAttributes<RapierRigidBody>>;
