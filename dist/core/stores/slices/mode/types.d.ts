import { ModeType, CameraType } from "../../types";
export interface ModeSlice {
    mode: ModeState;
    setMode: (mode: Partial<ModeState>) => void;
    resetMode: () => void;
}
export interface ModeState {
    type: ModeType;
    controller: ControllerOptionsType;
    camera: CameraType;
    settings: {
        showDebug: boolean;
        enablePhysics: boolean;
        enableAnimation: boolean;
        qualityLevel: 'low' | 'medium' | 'high';
    };
}
export interface ControllerOptionsType {
    lerp: {
        cameraTurn: number;
        cameraPosition: number;
    };
}
