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
    rigidBodyProps?: import("@react-three/rapier").RigidBodyProps;
    parts?: import("../../../controller/type").partsType;
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
    rigidBodyProps?: import("@react-three/rapier").RigidBodyProps;
    outerGroupProps?: THREE.Group<THREE.Object3DEventMap>;
    innerGroupProps?: THREE.Group<THREE.Object3DEventMap>;
    parts?: import("../../../controller/type").partsType;
} & import("./type").ridingType & import("../../passive/type").innerRefType & import("../../../controller/initialize/callback/type").callbackType & import("react").RefAttributes<RapierRigidBody>>;
