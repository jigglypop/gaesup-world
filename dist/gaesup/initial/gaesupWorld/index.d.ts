/// <reference types="react" />
import { initGaesupWorldPropsType } from "./type";
export default function initGaesupWorld(props: initGaesupWorldPropsType): {
    gaesupProps: {
        value: {
            activeState: import("../../world/context/type").activeStateType;
            characterCollider: import("../../world/context/type").characterColliderType;
            vehicleCollider: import("../../world/context/type").vehicleColliderType;
            airplaneCollider: import("../../world/context/type").airplaneColliderType;
            mode: import("../../world/context/type").modeType;
            url: import("../../world/context/type").urlType;
            characterGltf: import("../../component/gltf/type").GLTFResult;
            vehicleGltf: import("../../component/gltf/type").GLTFResult;
            wheelGltf: import("../../component/gltf/type").GLTFResult;
            airplaneGltf: import("../../component/gltf/type").GLTFResult;
            states: import("../../world/context/type").statesType;
            debug: boolean;
            minimap: import("../../tools/minimap/type").minimapInnerType;
            joystick: import("../../tools/joystick/type").joyStickInnerType;
            control: {
                [x: string]: boolean;
            };
            points: import("../../world/context/type").pointsType;
            refs: import("../../controller/type").refsType;
            animations: import("../../world/context/type").animationPropType;
            keyBoardMap: import("../../tools/type").keyboardMapType;
        };
        dispatch: import("react").Dispatch<{
            type: string;
            payload?: Partial<import("../../world/context/type").gaesupWorldPropType>;
        }>;
    };
};
