/// <reference types="react" />
import { activeStateType, characterColliderType, modeType, urlType } from "../../../world/context/type";
export type gaesupPassiveCharacterPropsType = {
    state: activeStateType;
    characterCollider?: characterColliderType;
    mode: modeType;
    url: urlType;
    currentAnimation: string;
    children?: React.ReactNode;
};
export type passiveVehiclePropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    vehicleSize: THREE.Vector3;
    wheelSize: THREE.Vector3;
    url: urlType;
    currentAnimation: string;
    children?: React.ReactNode;
};
