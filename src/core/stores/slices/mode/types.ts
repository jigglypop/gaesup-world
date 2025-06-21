import { ModeType, ControllerType, CameraType } from "../../types";

export interface ControllerOptionsType {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export interface ModeState {
  type: ModeType;
  controller: ControllerType;
  control: CameraType;
}

export interface ModeSlice {
  mode: ModeState;
  controllerOptions: ControllerOptionsType;
  setMode: (update: Partial<ModeState>) => void;
  setControllerOptions: (update: Partial<ControllerOptionsType>) => void;
}
