import { RigidBodyTypeString } from "@react-three/rapier";
import * as THREE from "three";
import { controllerOptionsType } from "../../../controller/type";
export type activeCharacterPropsType = {
    characterUrl: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    controllerOptions?: controllerOptionsType;
    currentAnimation?: string;
    children?: React.ReactNode;
    rigidbodyType?: RigidBodyTypeString;
};
