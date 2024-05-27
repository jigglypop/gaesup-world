import { CSSProperties } from "react";
import { actionsType, refsType } from "../../controller/type";

import { RootState } from "@react-three/fiber";
import * as THREE from "three";
import { rideableType } from "../../hooks/useRideable/type";
import { joyStickInnerType } from "../../tools/joystick/type";
import { keyboardMapType } from "../../tools/keyBoardToolTip/type";
import { minimapInnerType } from "../../tools/miniMap/type";
import { dispatchType } from "../../utils/type";

// camera option
export type gaesupCameraOptionDebugType = {
  maxDistance?: number;
  distance?: number;
  XDistance?: number;
  YDistance?: number;
  ZDistance?: number;
  zoom?: number;
  target?: THREE.Vector3;
  focus?: boolean;
  position?: THREE.Vector3;
};

export type cameraOptionType = {
  offset?: THREE.Vector3;
} & gaesupCameraOptionDebugType;

export type controlType = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  [key: string]: boolean;
};

export type keyControlType = {
  [key: string]: boolean;
};

export type portalType = {
  text?: string;
  position: THREE.Vector3;
  jumpPortalStlye?: CSSProperties;
};

export type portalsType = portalType[];

export type statesType = {
  rideableId?: string;
  isMoving: boolean;
  isNotMoving: boolean;
  isOnTheGround: boolean;
  isOnMoving: boolean;
  isRotated: boolean;
  isRunning: boolean;
  isJumping: boolean;
  enableRiding: boolean;
  isRiderOn: boolean;
  isPush: controlType;
  isLanding: boolean;
  isFalling: boolean;
  isRiding: boolean;
};

export type urlsType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

export type animationAtomType = {
  tag: string;
  condition: () => boolean;
  action?: () => void;
  animationName?: string;
  key?: string;
};

export type animationPropType = {
  current: string;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};

export type animationStatePropType = {
  current: string;
  animationNames?: actionsType;
  keyControl?: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};

export type modeType = {
  type?: "character" | "vehicle" | "airplane";
  controller?: "gameboy" | "keyboard" | "joystick" | "clicker";
  control?: "normal" | "orbit";
  isButton?: boolean;
};

export type activeStateType = {
  position: THREE.Vector3;
  impulse: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
};

// camera option
export type clickerType = {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
};
// 클리커 옵션
export type queueActionType = "stop";
export type queueFunctionType = {
  action: queueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

export type queueItemtype = THREE.Vector3 | queueFunctionType;

export type queueType = queueItemtype[];
export type clickerOptionType = {
  autoStart?: boolean;
  isRun?: boolean;
  throttle?: number;
  track?: boolean;
  loop?: boolean;
  queue?: queueType;
  line?: boolean;
};

export type wheelStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

export type blockType = {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
};

export type sizeType = {
  x: number;
  y: number;
  z: number;
};

export type wheelsStateType = {
  0?: wheelStateType;
  1?: wheelStateType;
  2?: wheelStateType;
  3?: wheelStateType;
};

export type passiveStateType = {
  position: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
};

export type animationStateType = {
  [key: string]: animationStatePropType;
};

export type sizesType = {
  [key: string]: THREE.Vector3;
};

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export type gaesupWorldContextType = {
  activeState: activeStateType;
  mode: modeType;
  urls: urlsType;
  states: statesType;
  debug: boolean;
  minimap: minimapInnerType;
  joystick: joyStickInnerType;
  control: KeyboardControlsState<string>;
  refs: refsType;
  animationState: animationStateType;
  keyBoardMap: keyboardMapType;
  cameraOption: cameraOptionType;
  clickerOption: clickerOptionType;
  clicker: clickerType;
  rideable: { [key: string]: rideableType };
  sizes: sizesType;
  block: blockType;
};

export type gaesupDisptachType = dispatchType<gaesupWorldContextType>;
