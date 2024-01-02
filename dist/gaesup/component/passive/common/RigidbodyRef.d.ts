import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
export declare const RigidBodyRef: import("react").ForwardRefExoticComponent<{
    children: ReactNode;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
} & import("react").RefAttributes<RapierRigidBody>>;
