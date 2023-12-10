import { createContext } from "react";
import { dispatchType, gaesupWorldPropType } from "./type";

export const modeDefault = {
  type: "character",
  controller: "keyboard",
};

export const GaesupWorldContext = createContext<gaesupWorldPropType>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<gaesupWorldPropType>>(null);
