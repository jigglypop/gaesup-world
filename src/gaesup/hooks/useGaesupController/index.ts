// "Please use this only as a subcomponent of GaesupWorld."

import { Camera } from "@react-three/fiber";
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
    cameraState: worldContext.cameraState,
  };
}

export type gaesupPassivePropsType = {
  state: activeStateType;
  cameraState?: Camera & {
    manual?: boolean;
  };
  vehicleCollider: vehicleColliderType;
  characterCollider?: characterColliderType;
  airplaneCollider?: airplaneColliderType;
  mode: modeType;
  url: urlType;
  currentAnimation: string;
  children?: React.ReactNode;
};
