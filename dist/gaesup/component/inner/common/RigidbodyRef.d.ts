import { CollisionEnterPayload, RapierRigidBody, RigidBodyTypeString } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
export declare const RigidBodyRef: import("react").ForwardRefExoticComponent<{
    children: ReactNode;
    name?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    userData?: {
        intangible: boolean;
    };
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    positionLerp?: number;
    type?: RigidBodyTypeString;
} & import("react").RefAttributes<RapierRigidBody>>;
