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

export type ModeState = {
  type: ModeType;
  controller: ControllerType;
  control: ControlType;
};

export type ControllerOptionsType = {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
};

export type ModeSlice = {
  mode: ModeState;
  controllerOptions: ControllerOptionsType;
  setMode: (update: Partial<ModeState>) => void;
  setControllerOptions: (update: Partial<ControllerOptionsType>) => void;
  resetMode: () => void;
};
