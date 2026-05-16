export declare function useGaesupContext(): {
    activeState: import("../..").ActiveStateType;
    states: import("../../world/components/Rideable/types").GameStatesType;
    sizes: import("../../stores/slices").SizesType;
    mode: import("../../stores/slices").ModeState;
    control: import("../../stores/slices").ControllerOptionsType;
    urls: import("../../stores/slices").UrlsState;
    minimap: {
        enabled: boolean;
        position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        size: number;
        opacity: number;
        showZoom: boolean;
        showCompass: boolean;
        updateInterval: number;
    };
    animationState: import("../..").EntityAnimationStates;
};
