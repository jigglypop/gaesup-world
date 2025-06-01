// "Please use this only as a subcomponent of GaesupWorld."

import { useContext } from "react";
import { useAtomValue } from "jotai";
import { GaesupWorldContext } from "../../world/context";
import { activeStateType, modeType, urlsType } from "../../world/context/type";
import { urlsAtom } from "../../atoms";

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useContext(GaesupWorldContext);
  const urls = useAtomValue(urlsAtom);
  return {
    state: worldContext.activeState,
    mode: worldContext.mode,
    urls: urls,
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
