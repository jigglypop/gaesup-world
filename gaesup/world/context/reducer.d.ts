import { gaesupWorldContextType } from "./type";
export declare function gaesupWorldReducer(props: Partial<gaesupWorldContextType>, action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
}): {
    activeState?: import("./type").activeStateType;
    mode?: import("./type").modeType;
    urls?: import("./type").urlsType;
    states?: import("./type").statesType;
    minimap?: import("../../tools/minimap/type").minimapInnerType;
    control?: {
        [x: string]: boolean;
    };
    refs?: import("../../controller/type").refsType;
    animationState?: import("./type").animationStateType;
    cameraOption?: import("./type").cameraOptionType;
    clickerOption?: import("./type").clickerOptionType;
    clicker?: import("./type").clickerType;
    rideable?: {
        [key: string]: import("../../hooks/useRideable/type").rideableType;
    };
    sizes?: import("./type").sizesType;
    block?: import("./type").blockType;
};
