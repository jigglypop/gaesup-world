/// <reference types="react" />
import { RigidBodyTypeString } from "@react-three/rapier";
import * as THREE from "three";
import { urlsType } from "../../../world/context/type";
export type passiveCharacterPropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    urls: urlsType;
    currentAnimation: string;
    gravityScale?: number;
    children?: React.ReactNode;
    positionLerp?: number;
    type?: RigidBodyTypeString;
};
export declare function PassiveCharacter(props: passiveCharacterPropsType): import("react/jsx-runtime").JSX.Element;
