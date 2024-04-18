/// <reference types="react" />
import { CollisionEnterPayload, RigidBodyTypeString } from "@react-three/rapier";
import * as THREE from "three";
import { refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
export type refPropsType = {
    children: React.ReactNode;
    refs: Partial<refsType>;
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
