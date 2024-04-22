import { Collider } from "@dimforge/rapier3d-compat";
import { CollisionEnterPayload, RapierRigidBody, RigidBodyTypeString } from "@react-three/rapier";
import { MutableRefObject } from "react";
import * as THREE from "three";
import { controllerOptionsType } from "../../controller/type";
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
    url: string;
    wheelUrl?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    offset?: THREE.Vector3;
    controllerOptions?: controllerOptionsType;
    currentAnimation?: string;
    rigidbodyType?: RigidBodyTypeString;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    componentType: componentTypeString;
    userData?: {
        intangible: boolean;
    };
} & ridingType;
