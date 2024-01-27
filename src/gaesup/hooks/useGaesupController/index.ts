// "Please use this only as a subcomponent of GaesupWorld."

import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import { activeStateType, modeType, urlsType } from "../../world/context/type";

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useContext(GaesupWorldContext);
  return {
    state: worldContext.activeState,
    mode: worldContext.mode,
    urls: worldContext.urls,
    currentAnimation: worldContext.mode.type
      ? worldContext.animationState[worldContext.mode.type].current
      : "idle",
  };
}

export type gaesupPassivePropsType = {
  state: activeStateType;
  mode: modeType;
  urls: urlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};
