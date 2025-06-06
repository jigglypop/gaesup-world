import { useContext } from "react";
import { useAtomValue } from "jotai";
import { GaesupContext } from "../../context";
import { ActiveStateType, ModeType, ResourceUrlsType } from "../../context";
import { urlsAtom } from "../../atoms";

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useContext(GaesupContext);
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
  state: ActiveStateType;
  mode: ModeType;
  urls: ResourceUrlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};
