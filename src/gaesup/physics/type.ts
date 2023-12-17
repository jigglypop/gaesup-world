import { RootState } from "@react-three/fiber";

import { World } from "@dimforge/rapier3d-compat";
import { gaesupControllerType } from "../controller/context/type";
import { controllerInnerType } from "../controller/type";
import { dispatchType } from "../utils/type";
import { gaesupWorldContextType } from "../world/context/type";

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type calcPropType = controllerInnerType & {
  state?: RootState;
  checkCollision?: (delta: number) => void;
  worldContext?: gaesupWorldContextType;
  controllerContext?: gaesupControllerType;
  delta?: number;
  dispatch?: dispatchType<gaesupWorldContextType>;
  world: World;
};

export type cameraPropType = controllerInnerType & {
  control: {
    [key: string]: boolean;
  };
  state?: RootState;
  worldContext?: gaesupWorldContextType;
  checkCollision?: (delta: number) => void;
  controllerContext?: gaesupControllerType;
  delta?: number;
};
