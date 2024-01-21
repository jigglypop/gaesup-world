import { RootState } from "@react-three/fiber";

import { World } from "@dimforge/rapier3d-compat";
import { gaesupControllerType } from "../controller/context/type";
import { controllerInnerType, refsType } from "../controller/type";
import { dispatchType } from "../utils/type";
import { gaesupWorldContextType, urlsType } from "../world/context/type";

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type hidratePropType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
} & Partial<refsType>;

export type calcPropType = controllerInnerType & {
  state?: RootState;
  worldContext?: gaesupWorldContextType;
  controllerContext?: gaesupControllerType;
  matchSizes?: {
    [key in keyof urlsType]?: THREE.Vector3;
  };
  delta?: number;
  dispatch?: dispatchType<gaesupWorldContextType>;
  world: World;
};

export type intersectObjectMapType = {
  [uuid: string]: THREE.Mesh;
};

export type cameraPropType = controllerInnerType & {
  control: {
    [key: string]: boolean;
  };
  state?: RootState;
  worldContext?: gaesupWorldContextType;
  controllerContext?: gaesupControllerType;
  intersectObjectMap?: intersectObjectMapType;
  delta?: number;
  dist?: number;
};
