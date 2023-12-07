import { createContext } from "react";
import { GLTFResult } from "../../type";

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
};

export type urlType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
};

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
};

export type gaesupWorldPartialPropType = Partial<gaesupWorldPropType>;

export const characterColliderDefault = {
  halfHeight: 0.35,
  height: 0.7,
  radius: 0.3,
  diameter: 0.6,
};

export const vehicleColliderDefault = {
  wheelSizeX: 0.5,
  wheelSizeY: 0.5,
  wheelSizeZ: 0.5,
  vehicleSizeX: 1,
  vehicleSizeY: 1,
  vehicleSizeZ: 1,
  vehicleX: 0.5,
  vehicleY: 0.5,
  vehicleZ: 0.5,
};

export const airplaneColliderDefault = {
  airplaneSizeX: 1,
  airplaneSizeY: 1,
  airplaneSizeZ: 1,
  airplaneX: 0.5,
  airplaneY: 0.5,
  airplaneZ: 0.5,
};

export const urlDefault = {
  characterUrl: null,
  vehicleUrl: null,
  airplaneUrl: null,
};

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
