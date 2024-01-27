import { gaesupWorldContextType } from "./type";
export declare function gaesupWorldReducer(props: gaesupWorldContextType, action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
}): {
    activeState: import("./type").activeStateType;
    mode: import("./type").modeType;
    urls: import("./type").urlsType;
    states: import("./type").statesType;
    debug: boolean;
    minimap: import("../../tools/miniMap/type").minimapInnerType;
    joystick: import("../../tools/joyStick/type").joyStickInnerType;
    control: {
        [x: string]: boolean;
    };
    refs: import("../../controller/type").refsType;
    animationState: import("./type").animationStateType;
    keyBoardMap: import("../../tools/keyBoardToolTip/type").keyboardMapType;
    cameraOption: import("./type").cameraOptionType;
    moveTo: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
    rideable: {
        [key: string]: import("./type").rideableType;
    };
    sizes: import("./type").sizesType;
    block: import("./type").blockType;
    callback: {
        moveTo: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
    };
};
