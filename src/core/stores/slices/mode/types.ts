export type ModeType = 'character' | 'vehicle' | 'airplane';
export type ControllerType = 'keyboard' | 'clicker' | 'gamepad';
export type CameraType =
  | 'chase'
  | 'first-person'
  | 'third-person'
  | 'fixed'
  | 'isometric'
  | 'top-down'
  | 'side-scroll';

export type ControllerOptionsType = {
  [key: string]: any;
};

export interface ModeState {
  modeType: ModeType;
  controller: ControllerOptionsType;
  camera: CameraType;
  settings: {
    showDebug: boolean;
    enablePhysics: boolean;
    enableAnimation: boolean;
    qualityLevel: 'low' | 'medium' | 'high';
  };
}

export interface ModeSlice {
  mode: ModeState;
  controllerOptions: ControllerOptionsType;
  setMode: (update: Partial<ModeState>) => void;
  setControllerOptions: (update: Partial<ControllerOptionsType>) => void;
  resetMode: () => void;
}
