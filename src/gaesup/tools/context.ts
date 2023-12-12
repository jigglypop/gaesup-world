import { createContext } from "react";
import { dispatchType, gaesupToolsPropType } from "./type";

export const GaesupToolsContext = createContext<gaesupToolsPropType>(null);
export const GaesupToolsDispatchContext =
  createContext<dispatchType<gaesupToolsPropType>>(null);
