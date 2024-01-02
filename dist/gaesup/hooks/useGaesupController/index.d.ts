/// <reference types="react" />
import { Camera } from "@react-three/fiber";
import { activeStateType, airplaneColliderType, characterColliderType, modeType, urlType, vehicleColliderType } from "../../world/context/type";
export declare function useGaesupController(): gaesupPassivePropsType;
export type gaesupPassivePropsType = {
    state: activeStateType;
    cameraState?: Camera & {
        manual?: boolean;
    };
    vehicleCollider: vehicleColliderType;
    characterCollider?: characterColliderType;
    airplaneCollider?: airplaneColliderType;
    mode: modeType;
    url: urlType;
    currentAnimation: string;
    children?: React.ReactNode;
};
