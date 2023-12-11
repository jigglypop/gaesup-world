import { Dispatch } from "react";
import { GLTFResult } from "../../../component/gltf/type";
import { refsType } from "../../../controller/type";
import { activeStateType } from "../../active/type";
import { animationPropType } from "../../animation/type";
import {
  airplaneColliderType,
  characterColliderType,
  vehicleColliderType,
} from "../../collider";
import { gameboyType } from "../../gameboy/type";
import { joyStickType } from "../../joystick/type";
import { minimapType } from "../../minimap/type";
import { pointsType } from "../../point/type";
import { statesType } from "../../states/type";
import { urlType } from "../../url/type";

export type characterOptionType = {
  type?: "character";
  controller?: "gameboy" | "keyboard" | "joystick";
};
export type vehicleOptionType = {
  type?: "vehicle";
  controller?: "gameboy" | "keyboard" | "joystick";
};
export type airplaneOptionType = {
  type?: "airplane";
  controller?: "gameboy" | "keyboard" | "joystick";
};

export type gaesupControllerPropType =
  | characterOptionType
  | vehicleOptionType
  | airplaneOptionType;

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export type gaesupWorldPropType = {
  activeState: activeStateType;
  characterCollider: characterColliderType;
  vehicleCollider: vehicleColliderType;
  airplaneCollider: airplaneColliderType;
  mode: gaesupControllerPropType;
  url: urlType;
  characterGltf: GLTFResult;
  vehicleGltf: GLTFResult;
  wheelGltf: GLTFResult;
  airplaneGltf: GLTFResult;
  states: statesType;
  debug: boolean;
  minimap: minimapType;
  joystick: joyStickType;
  gameboy: gameboyType;
  control: KeyboardControlsState<string>;
  points: pointsType;
  refs: refsType;
  animations: animationPropType;
};

export type dispatchType<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

export type gaesupWorldPartialPropType = Partial<gaesupWorldPropType>;
export type gaesupDisptachType = Dispatch<{
  type: string;
  payload?: Partial<gaesupWorldPropType>;
}>;
