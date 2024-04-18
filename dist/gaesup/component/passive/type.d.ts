import { gaesupPassivePropsType } from "../../hooks/useGaesupController";
import { activeStateType, modeType, wheelsStateType } from "../../world/context/type";
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
