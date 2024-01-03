// "Please use this only as a subcomponent of GaesupWorld."

import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import {
  activeStateType,
  airplaneColliderType,
  characterColliderType,
  modeType,
  urlType,
  vehicleColliderType,
} from "../../world/context/type";

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useContext(GaesupWorldContext);
  return {
    state: worldContext.activeState,
    vehicleCollider: worldContext.vehicleCollider,
    characterCollider: worldContext.characterCollider,
    airplaneCollider: worldContext.airplaneCollider,
    mode: worldContext.mode,
    url: worldContext.url,
    currentAnimation: worldContext.animations.current,
  };
}

export type gaesupPassivePropsType = {
  state: activeStateType;

  vehicleCollider: vehicleColliderType;
  characterCollider?: characterColliderType;
  airplaneCollider?: airplaneColliderType;
  mode: modeType;
  url: urlType;
  currentAnimation: string;
  children?: React.ReactNode;
};
