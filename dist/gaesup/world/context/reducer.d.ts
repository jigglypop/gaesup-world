import { gaesupWorldContextType } from "./type";
export declare function gaesupWorldReducer(props: Partial<gaesupWorldContextType>, action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
}): {
    activeState?: import("./type").activeStateType;
    mode?: import("./type").modeType;
    urls?: import("./type").urlsType;
    states?: import("./type").statesType;
    debug?: boolean;
    minimap?: import("../../tools/miniMap/type").minimapInnerType;
    joystick?: import("../../tools/joystick/type").joyStickInnerType;
    control?: {
        [x: string]: boolean;
    };
    refs?: import("../../controller/type").refsType;
    animationState?: import("./type").animationStateType;
    keyBoardMap?: import("../../tools/keyBoardToolTip/type").keyboardMapType;
    cameraOption?: import("./type").cameraOptionType;
    clickerOption?: import("./type").clickerOptionType;
    clicker?: import("./type").clickerType;
    moveTo?: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
    rideable?: {
        [key: string]: import("../../hooks/useRideable/type").rideableType;
    };
    sizes?: import("./type").sizesType;
    block?: import("./type").blockType;
    callback?: {
        moveTo: (position: import("three").Vector3, target: import("three").Vector3) => Promise<void>;
    };
};
