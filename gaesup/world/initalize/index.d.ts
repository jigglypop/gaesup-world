import { gaesupWorldPropsType } from "../type";
export default function initGaesupWorld(props: gaesupWorldPropsType): {
    gaesupProps: {
        value: {
            activeState?: import("../context/type").activeStateType;
            mode?: import("../context/type").modeType;
            urls?: import("../context/type").urlsType;
            states?: import("../context/type").statesType;
            minimap?: import("../../tools/minimap/type").minimapInnerType;
            control?: {
                [x: string]: boolean;
            };
            refs?: import("../../controller/type").refsType;
            animationState?: import("../context/type").animationStateType;
            cameraOption?: import("../context/type").cameraOptionType;
            clickerOption?: import("../context/type").clickerOptionType;
            clicker?: import("../context/type").clickerType;
            rideable?: {
                [key: string]: import("../../hooks/useRideable/type").rideableType;
            };
            sizes?: import("../context/type").sizesType;
            block?: import("../context/type").blockType;
        };
        dispatch: import("react").Dispatch<{
            type: string;
            payload?: Partial<import("../context/type").gaesupWorldContextType>;
        }>;
    };
};
