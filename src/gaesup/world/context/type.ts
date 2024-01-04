import { CSSProperties } from "react";
import { GLTFResult } from "../../component/type";
import { actionsType, animationTagType, refsType } from "../../controller/type";

import { joyStickInnerType } from "../../tools/joyStick/type";
import { keyboardMapType } from "../../tools/keyBoardToolTip/type";
import { minimapInnerType } from "../../tools/miniMap/type";
import { dispatchType } from "../../utils/type";

// camera option
export type gaesupCameraOptionDebugType = {
  initDistance?: number;
  maxDistance?: number;
  minDistance?: number;
  initDir?: number;
  distance?: number;
  camFollow?: number;
  XZDistance?: number;
  XDistance?: number;
  YDistance?: number;
  ZDistance?: number;
};

export type cameraOptionType = {
  offset?: THREE.Vector3;
  collisionOff?: number;
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
  isMoving: boolean;
  isNotMoving: boolean;
  isOnTheGround: boolean;
  isOnMoving: boolean;
  isRotated: boolean;
  isRunning: boolean;
  isJumping: boolean;
  isAnimationOuter: boolean;
};

export type urlType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
};

export type animationPropType = {
  current: keyof animationTagType;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
};

export type characterColliderType = {
  halfHeight?: number;
  height?: number;
  radius?: number;
  diameter?: number;
};

export type vehicleColliderType = {
  wheelSizeX?: number;
  wheelSizeY?: number;
  wheelSizeZ?: number;
  vehicleSizeX?: number;
  vehicleSizeY?: number;
  vehicleSizeZ?: number;
  vehicleX?: number;
  vehicleY?: number;
  vehicleZ?: number;
};

export type airplaneColliderType = {
  airplaneSizeX?: number;
  airplaneSizeY?: number;
  airplaneSizeZ?: number;
  airplaneX?: number;
  airplaneY?: number;
  airplaneZ?: number;
  gravity?: number;
};

export type modeType = {
  type?: "character" | "vehicle" | "airplane";
  controller?: "gameboy" | "keyboard" | "joystick";
  control?: "normal" | "orbit";
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

export type wheelStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
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

export type rideableType = {
  isRiding: boolean;
  objectType?: "vehicle" | "airplane";
  url?: string;
  wheelUrl?: string;
};

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export type gaesupWorldContextType = {
  activeState: activeStateType;
  characterCollider: characterColliderType;
  vehicleCollider: vehicleColliderType;
  airplaneCollider: airplaneColliderType;
  mode: modeType;
  url: urlType;
  characterGltf: GLTFResult;
  vehicleGltf: GLTFResult;
  wheelGltf: GLTFResult;
  airplaneGltf: GLTFResult;
  states: statesType;
  debug: boolean;
  minimap: minimapInnerType;
  joystick: joyStickInnerType;
  control: KeyboardControlsState<string>;
  refs: refsType;
  animations: animationPropType;
  keyBoardMap: keyboardMapType;
  cameraOption: cameraOptionType;
  moveTo: (position: THREE.Vector3, target: THREE.Vector3) => Promise<void>;
  cameraBlock: boolean;
  controlBlock: boolean;
  scrollBlock: boolean;
  rideable: rideableType;
};

export type gaesupDisptachType = dispatchType<gaesupWorldContextType>;
