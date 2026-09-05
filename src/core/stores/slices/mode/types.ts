export type ModeType = 'character' | 'vehicle' | 'airplane';
export type ControllerType = 'keyboard' | 'clicker' | 'gamepad';
export type ControlType =
  | 'thirdPerson'
  | 'firstPerson'
  | 'topDown'
  | 'sideScroll'
  | 'isometric'
  | 'fixed'
  | 'chase';

export interface ModeState {
  type: ModeType;
  controller: ControllerType;
  control: ControlType;
}

export interface ControllerOptionsType {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export interface ModeSlice {
  mode: ModeState;
  controllerOptions: ControllerOptionsType;
  setMode: (update: Partial<ModeState>) => void;
  setControllerOptions: (update: Partial<ControllerOptionsType>) => void;
  resetMode: () => void;
}
