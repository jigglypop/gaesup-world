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
            characterGltf: import("../../component/type").GLTFResult;
            vehicleGltf: import("../../component/type").GLTFResult;
            wheelGltf: import("../../component/type").GLTFResult;
            airplaneGltf: import("../../component/type").GLTFResult;
            states: import("../context/type").statesType;
            debug: boolean;
            minimap: import("../../tools/miniMap/type").minimapInnerType;
            joystick: import("../../tools/joyStick/type").joyStickInnerType;
            control: {
                [x: string]: boolean;
            };
            refs: import("../../controller/type").refsType;
            animations: import("../context/type").animationPropType;
            keyBoardMap: import("../../tools/keyBoardToolTip/type").keyboardMapType;
            cameraOption: import("../context/type").cameraOptionType;
            moveTo: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
            cameraBlock: boolean;
            controlBlock: boolean;
            scrollBlock: boolean;
            rideable: {
                [key: string]: import("../context/type").rideableType;
            };
        };
        dispatch: import("react").Dispatch<{
            type: string;
            payload?: Partial<import("../context/type").gaesupWorldContextType>;
        }>;
    };
};
