import { RootState } from "@react-three/fiber";
import { cameraRayType } from "../../../camera/type";
import {
  activeStateType,
  animationPropType,
  keyControlType,
  statesType,
} from "../../../world/context/type";
import { actionsType, groundRayType, slopeRayType } from "../../type";

export type callbackPropType = {
  activeState: activeStateType;
  states: statesType;
  slopeRay: slopeRayType;
  groundRay: groundRayType;
  cameraRay: cameraRayType;
  control: keyControlType;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animation: animationPropType;
  playAnimation: (tag: keyof actionsType, key: string) => void;
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestory?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};
