/// <reference types="react" />
import { gaesupPassivePropsType } from "../../hooks/useGaesupController";
import { activeStateType, characterColliderType, modeType, vehicleColliderType, wheelsStateType } from "../../world/context/type";
export type passiveComponentType = {
    props: gaesupPassivePropsType;
};
export type passiveCharacterType = {
    mode: modeType;
    state: activeStateType;
    current: string;
    url: string;
};
export type passiveVehicleType = {
    mode: modeType;
    state: activeStateType;
    wheelsState?: wheelsStateType;
    wheelPositions?: number[][];
    current: string;
    url: string;
    wheelUrl?: string;
};
export type passiveVehicleInnerType = {
    rigidBodyRef: React.MutableRefObject<THREE.Object3D | undefined>;
    collider: vehicleColliderType;
    wheelOffset: number;
};
export type passiveCharacterInnerType = {
    rigidBodyRef: React.MutableRefObject<THREE.Object3D | undefined>;
    collider: characterColliderType;
};
