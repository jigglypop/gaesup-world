/// <reference types="react" />
import { refsType } from "../../../controller/type";
import { activeStateType, characterColliderType, modeType, urlType } from "../../../world/context/type";
export type gaesupPassiveCharacterPropsType = {
    state: activeStateType;
    characterCollider?: characterColliderType;
    mode: modeType;
    url: urlType;
    currentAnimation: string;
    children?: React.ReactNode;
};
export type passiveCharacterPropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    height: number;
    diameter: number;
    url: urlType;
    currentAnimation: string;
    children?: React.ReactNode;
};
export type mutateCharacterPropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    height: number;
    diameter: number;
    delta?: number;
} & Partial<refsType>;
