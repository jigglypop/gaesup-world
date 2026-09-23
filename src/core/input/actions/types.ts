export type InputDeviceKind = 'keyboard' | 'mouse' | 'gamepad' | 'touch';

export type InputActionKind = 'button' | 'axis1D' | 'axis2D';

export type InputBinding = {
  device: InputDeviceKind;
  code: string;
  scale?: number;
  axis?: 'x' | 'y';
};

export type InputActionDefinition = {
  name: string;
  kind: InputActionKind;
  bindings: InputBinding[];
  deadzone?: number;
};

export type InputActionState = {
  pressed: boolean;
  down: boolean;
  up: boolean;
  value: number;
  x: number;
  y: number;
};

export type InputDeviceState = {
  keyboard: Set<string>;
  mouse: Set<string>;
  gamepad: Map<string, number>;
  touch: Map<string, number>;
};

export type InputRecordingFrame = Record<string, readonly [number, number, number]>;

export type InputRecording = {
  version: 1;
  frames: InputRecordingFrame[];
};

export type BrowserInputDevices = {
  state: InputDeviceState;
  poll: () => void;
  dispose: () => void;
};

export type InputActionMapLike = {
  get: (name: string) => Readonly<InputActionState> | undefined;
};

export type UseInputActionsOptions = {
  definitions?: InputActionDefinition[];
  active?: boolean;
  onFrame?: (map: InputActionMapLike) => void;
};
