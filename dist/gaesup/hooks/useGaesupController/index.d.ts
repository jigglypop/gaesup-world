/// <reference types="react" />
import { activeStateType, modeType, urlsType } from "../../world/context/type";
export declare function useGaesupController(): gaesupPassivePropsType;
export type gaesupPassivePropsType = {
    state: activeStateType;
    mode: modeType;
    urls: urlsType;
    currentAnimation: string;
    children?: React.ReactNode;
};
