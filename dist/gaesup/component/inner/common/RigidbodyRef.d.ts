/// <reference types="react" />
import { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
export declare const RigidBodyRef: import("react").ForwardRefExoticComponent<{
    name?: string;
    userData?: {
        intangible: boolean;
    };
    isActive?: boolean;
    ridingUrl?: string;
    groundRay?: import("../../../controller/type").groundRayType;
    rigidBodyProps?: RapierRigidBody;
} & {
    children?: import("react").ReactNode;
    groundRay?: import("../../../controller/type").groundRayType;
    url: string;
    ridingUrl?: string;
    wheelUrl?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    offset?: THREE.Vector3;
    controllerOptions?: import("../../../controller/type").controllerOptionsType;
    currentAnimation?: string;
    rigidbodyType?: import("@react-three/rapier").RigidBodyTypeString;
    sensor?: boolean;
    onIntersectionEnter?: (e: import("@react-three/rapier").CollisionEnterPayload) => Promise<void>;
    onCollisionEnter?: (e: import("@react-three/rapier").CollisionEnterPayload) => Promise<void>;
    componentType: import("../../passive/type").componentTypeString;
    userData?: {
        intangible: boolean;
    };
    rigidBodyProps?: RapierRigidBody;
    outerGroupProps?: THREE.Group<THREE.Object3DEventMap>;
    innerGroupProps?: THREE.Group<THREE.Object3DEventMap>;
} & import("./type").ridingType & import("../../passive/type").innerRefType & import("../../../controller/initialize/callback/type").callbackType & import("react").RefAttributes<RapierRigidBody>>;
