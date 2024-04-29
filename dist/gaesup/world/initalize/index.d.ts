/// <reference types="react" />
import { gaesupWorldPropsType } from "../type";
export default function initGaesupWorld(props: gaesupWorldPropsType): {
    gaesupProps: {
        value: {
            activeState?: import("../context/type").activeStateType;
            mode?: import("../context/type").modeType;
            urls?: import("../context/type").urlsType;
            states?: import("../context/type").statesType;
            debug?: boolean;
            minimap?: import("../../tools/miniMap/type").minimapInnerType;
            joystick?: import("../../tools/joystick/type").joyStickInnerType;
            control?: {
                [x: string]: boolean;
            };
            refs?: import("../../controller/type").refsType;
            animationState?: import("../context/type").animationStateType;
            keyBoardMap?: import("../../tools/keyBoardToolTip/type").keyboardMapType;
            cameraOption?: import("../context/type").cameraOptionType;
            clickerOption?: import("../context/type").clickerOptionType;
            clicker?: import("../context/type").clickerType;
            moveTo?: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
            rideable?: {
                [key: string]: import("../../hooks/useRideable/type").rideableType;
            };
            sizes?: import("../context/type").sizesType;
            block?: import("../context/type").blockType;
            callback?: {
                moveTo: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
            };
        };
        dispatch: import("react").Dispatch<{
            type: string;
            payload?: Partial<import("../context/type").gaesupWorldContextType>;
        }>;
    };
};
