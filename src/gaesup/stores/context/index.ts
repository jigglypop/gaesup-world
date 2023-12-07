import { Dispatch, createContext } from "react";
import { GLTFResult } from "../../type";
import {
  airplaneColliderType,
  characterColliderType,
  vehicleColliderType,
} from "../collider";
import { statesType } from "../states";
import { urlType } from "../url";

export type optionType = {
  mode?: "character" | "vehicle" | "airplane";
};

export type gaesupWorldPropType = {
  characterCollider: characterColliderType;
  vehicleCollider: vehicleColliderType;
  airplaneCollider: airplaneColliderType;
  option: optionType;
  url: urlType;
  characterGltf: GLTFResult;
  vehicleGltf: GLTFResult;
  wheelGltf: GLTFResult;
  airplaneGltf: GLTFResult;
  states: statesType;
};

export type gaesupWorldPartialPropType = Partial<gaesupWorldPropType>;

export type gaesupDisptachType = Dispatch<{
  type: string;
  payload?: Partial<gaesupWorldPropType>;
}>;

export const optionDefault = {
  mode: "character",
};

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

export const GaesupWorldDispatchContext = createContext(null);
export const GaesupWorldContext = createContext(null);
