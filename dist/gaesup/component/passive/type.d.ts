import { Collider } from "@dimforge/rapier3d-compat";
import { CollisionEnterPayload, RapierRigidBody, RigidBodyProps, RigidBodyTypeString } from "@react-three/rapier";
import { MutableRefObject } from "react";
import * as THREE from "three";
import { controllerOptionsType, groundRayType } from "../../controller/type";
import { ridingType } from "../inner/common/type";
export type componentTypeString = "character" | "vehicle" | "airplane";
export type innerRefType = {
    colliderRef: MutableRefObject<Collider>;
    rigidBodyRef: MutableRefObject<RapierRigidBody>;
    outerGroupRef: MutableRefObject<THREE.Group>;
    innerGroupRef: MutableRefObject<THREE.Group>;
};
export type passivePropsType = {
    children?: React.ReactNode;
    groundRay?: groundRayType;
    url: string;
    ridingUrl?: string;
    wheelUrl?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    offset?: THREE.Vector3;
    controllerOptions?: controllerOptionsType;
    currentAnimation?: string;
    rigidbodyType?: RigidBodyTypeString;
    sensor?: boolean;
    onIntersectionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    componentType: componentTypeString;
    userData?: {
        intangible: boolean;
    };
    rigidBodyProps?: RigidBodyProps;
    outerGroupProps?: THREE.Group;
    innerGroupProps?: THREE.Group;
} & ridingType;
