import { activeStateType, airplaneColliderType, characterColliderType, modeType, urlType, vehicleColliderType } from "../../world/context/type";
export declare function useGaesupController(): gaesupPassivePropsType;
export type gaesupPassivePropsType = {
    state: activeStateType;
    vehicleCollider: vehicleColliderType;
    characterCollider?: characterColliderType;
    airplaneCollider?: airplaneColliderType;
    wheelOffset: number;
    mode: modeType;
    url: urlType;
    currentAnimation: string;
};
