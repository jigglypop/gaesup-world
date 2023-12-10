import { Dispatch, createContext } from "react";
import { GLTFResult } from "../../component/gltf/type";
import { refsType } from "../../controller/type";
import { activeStateType } from "../active/type";
import { animationPropType } from "../animation";
import {
  airplaneColliderType,
  characterColliderType,
  vehicleColliderType,
} from "../collider";
import { controlType } from "../control/type";
import { joyStickType } from "../joystick";
import { minimapType } from "../minimap";
import { pointsType } from "../point/type";
import { statesType } from "../states";
import { urlType } from "../url";

export type characterOptionType = {
  type?: "character";
  controller?: "gameboy" | "keyboard" | "joystick";
};
export type vehicleOptionType = {
  type?: "vehicle";
  controller?: "keyboard" | "joystick" | "steeringWheel";
};
export type airplaneOptionType = {
  type?: "airplane";
  controller?: "keyboard" | "joystick" | "steeringWheel";
};

export type gaesupControllerPropType =
  | characterOptionType
  | vehicleOptionType
  | airplaneOptionType;

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
  control: controlType;
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

export function gaesupReducer(
  props: gaesupWorldPropType,
  action: {
    type: string;
    payload?: gaesupWorldPartialPropType;
  }
) {
  switch (action.type) {
    case "init": {
      return { ...props };
    }
    case "update": {
      return { ...props, ...action.payload };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export const modeDefault = {
  type: "character",
  controller: "keyboard",
};

export const GaesupWorldContext = createContext<gaesupWorldPropType>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<gaesupWorldPropType>>(null);
