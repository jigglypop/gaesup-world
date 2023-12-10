import { RootState } from "@react-three/fiber";
import { cameraRayType } from "../../camera/type";
import {
  actionsType,
  constantType,
  groundRayType,
  propType,
  slopeRayType,
} from "../../controller/type";
import { activeStateType } from "../../stores/active/type";
import { animationPropType } from "../../stores/animation/type";
import { keyControlType } from "../../stores/control/type";
import { statesType } from "../../stores/states/type";

export type initCallbackType = {
  prop: propType;
  callbacks?: callbackType;
  outerGroupRef: React.MutableRefObject<THREE.Group | undefined>;
};

export type callbackPropType = {
  activeState: activeStateType;
  states: statesType;
  slopeRay: slopeRayType;
  groundRay: groundRayType;
  cameraRay: cameraRayType;
  constant: constantType;
  control: keyControlType;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animation: animationPropType;
  playAnimation: (tag: keyof actionsType) => void;
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestory?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};
