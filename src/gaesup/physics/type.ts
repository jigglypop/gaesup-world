import { RootState } from "@react-three/fiber";
import { propType } from "../controller/type";
import { gaesupDisptachType, gaesupWorldPropType } from "../stores/context";
import { gaesupControllerType } from "../stores/context/controller";

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type calcPropType = propType & {
  control: {
    [key: string]: boolean;
  };
  state?: RootState;
  checkCollision?: (delta: number) => void;
  worldContext?: gaesupWorldPropType;
  controllerContext?: gaesupControllerType;
  delta?: number;
  dispatch?: gaesupDisptachType;
};

export type cameraPropType = propType & {
  control: {
    [key: string]: boolean;
  };
  state?: RootState;
  worldContext?: gaesupWorldPropType;
  checkCollision?: (delta: number) => void;
  controllerContext?: gaesupControllerType;
  delta?: number;
};
