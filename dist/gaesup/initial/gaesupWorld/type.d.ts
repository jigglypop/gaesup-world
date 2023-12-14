import { Dispatch, ReactNode } from "react";
import { joyStickInnerType } from "../../tools/joystick/type";
import { minimapInnerType } from "../../tools/minimap/type";
import { keyboardMapType } from "../../tools/type";
import { airplaneColliderType, characterColliderType, gaesupWorldPartialPropType, gaesupWorldPropType, modeType, urlType, vehicleColliderType } from "../../world/context/type";
import { getGltfResultType } from "./collider/gltf";
export type initGaesupWorldPropsType = {
    children: ReactNode;
    startPosition?: THREE.Vector3;
    props?: gaesupWorldPartialPropType;
    url?: urlType;
    characterCollider?: characterColliderType;
    vehicleCollider?: vehicleColliderType;
    airplaneCollider?: airplaneColliderType;
    mode?: modeType;
    debug?: boolean;
    minimap?: Omit<minimapInnerType, "props">;
    joystick?: joyStickInnerType;
    keyBoardMap?: keyboardMapType;
};
export type innerColliderPropType = {
    gltf?: getGltfResultType;
    value: gaesupWorldPropType;
    dispatch: Dispatch<{
        type: string;
        payload?: Partial<gaesupWorldPropType>;
    }>;
};
