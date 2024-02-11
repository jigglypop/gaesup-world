import { CollisionEnterPayload, RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
export declare const RigidBodyRef: import("react").ForwardRefExoticComponent<{
    children: ReactNode;
    name?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    userData?: {
        intangible: boolean;
    };
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
} & import("react").RefAttributes<RapierRigidBody>>;
