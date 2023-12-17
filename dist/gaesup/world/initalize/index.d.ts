/// <reference types="react" />
import { gaesupWorldPropsType } from "../type";
export default function initGaesupWorld(props: gaesupWorldPropsType): {
    gaesupProps: {
        value: {
            activeState: import("../context/type").activeStateType;
            characterCollider: import("../context/type").characterColliderType;
            vehicleCollider: import("../context/type").vehicleColliderType;
            airplaneCollider: import("../context/type").airplaneColliderType;
            mode: import("../context/type").modeType;
            url: import("../context/type").urlType;
            characterGltf: import("../../component/gltf/type").GLTFResult;
            vehicleGltf: import("../../component/gltf/type").GLTFResult;
            wheelGltf: import("../../component/gltf/type").GLTFResult;
            airplaneGltf: import("../../component/gltf/type").GLTFResult;
            states: import("../context/type").statesType;
            debug: boolean;
            minimap: import("../../tools/minimap/type").minimapInnerType;
            joystick: import("../../tools/joystick/type").joyStickInnerType;
            control: {
                [x: string]: boolean;
            };
            points: import("../context/type").pointsType;
            refs: import("../../controller/type").refsType;
            animations: import("../context/type").animationPropType;
            keyBoardMap: import("../../tools/keyBoardToolTip/type").keyboardMapType;
        };
        dispatch: import("react").Dispatch<{
            type: string;
            payload?: Partial<import("../context/type").gaesupWorldContextType>;
        }>;
    };
};
