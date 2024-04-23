import { Collider } from "@dimforge/rapier3d-compat";
import { CollisionEnterPayload, RigidBodyTypeString } from "@react-three/rapier";
import { MutableRefObject, RefObject } from "react";
import * as THREE from "three";
import { groundRayType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { innerRefType, passivePropsType } from "../../passive/type";
export type characterColliderType = {
    height: number;
    halfHeight: number;
    radius: number;
    diameter: number;
};
export type InnerGroupRefType = {
    children?: React.ReactNode;
    objectNode: THREE.Object3D;
    animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
    nodes: {
        [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
    };
    isActive?: boolean;
    ridingUrl?: string;
    offset?: THREE.Vector3;
} & ridingType;
export type ridingType = {
    isRiderOn?: boolean;
    enableRiding?: boolean;
};
export type refPropsType = {
    children: React.ReactNode;
    urls: urlsType;
    isRiderOn?: boolean;
    enableRiding?: boolean;
    offset?: THREE.Vector3;
    name?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    userData?: {
        intangible: boolean;
    };
    currentAnimation?: string;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    type?: RigidBodyTypeString;
};
export type setGroundRayType = {
    groundRay: groundRayType;
    length: number;
    colliderRef: RefObject<Collider>;
};
export type rigidBodyRefType = {
    name?: string;
    userData?: {
        intangible: boolean;
    };
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    isActive?: boolean;
    ridingUrl?: string;
} & passivePropsType & innerRefType;
