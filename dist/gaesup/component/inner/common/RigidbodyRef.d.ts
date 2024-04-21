/// <reference types="react" />
import { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
export declare const RigidBodyRef: import("react").ForwardRefExoticComponent<{
    children: import("react").ReactNode;
    name?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    userData?: {
        intangible: boolean;
    };
    onCollisionEnter?: (e: import("@react-three/rapier").CollisionEnterPayload) => Promise<void>;
    positionLerp?: number;
    type?: import("@react-three/rapier").RigidBodyTypeString;
    url: string;
    isActive?: boolean;
    currentAnimation?: string;
    componentType: "vehicle" | "airplane" | "character";
} & import("../../../physics/type").propInnerType & import("react").RefAttributes<RapierRigidBody>>;
