import { CollisionEnterPayload, RigidBodyTypeString } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import { refsType } from "../../../controller/type";
import { propInnerType } from "../../../physics/type";
import { urlsType } from "../../../world/context/type";
export type vehicleInnerType = {
    children: ReactNode;
    refs: Partial<refsType>;
    urls: urlsType;
    position?: THREE.Vector3;
    positionLerp?: number;
    euler?: THREE.Euler;
    type?: RigidBodyTypeString;
    componentType: "character" | "vehicle" | "airplane";
    currentAnimation?: string;
    isActive?: boolean;
} & {
    name?: string;
    userData?: {
        intangible: boolean;
    };
    isRiderOn?: boolean;
    enableRiding?: boolean;
    offset?: THREE.Vector3;
    rotation?: THREE.Euler;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
} & propInnerType;
