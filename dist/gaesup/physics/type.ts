import { RootState } from "@react-three/fiber";

import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import * as THREE from "three";
import { gaesupControllerType } from "../controller/context/type";
import {
  controllerOptionsType,
  groundRayType,
  refsType,
} from "../controller/type";
import { dispatchType } from "../utils/type";
import { gaesupWorldContextType, urlsType } from "../world/context/type";

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type hidratePropType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
} & Partial<refsType>;

export type propInnerType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

export type calcPropType = propInnerType & {
  state?: RootState;
  worldContext?: Partial<gaesupWorldContextType>;
  controllerContext?: gaesupControllerType;
  matchSizes?: {
    [key in keyof urlsType]?: THREE.Vector3;
  };
  delta?: number;
  dispatch?: dispatchType<gaesupWorldContextType>;
};

export type intersectObjectMapType = {
  [uuid: string]: THREE.Mesh;
};

export type cameraPropType = {
  state?: RootState;
  worldContext: Partial<gaesupWorldContextType>;
  controllerContext: gaesupControllerType;
  controllerOptions: controllerOptionsType;
};

// calculation
export type calcType = calcPropType & {
  groundRay: groundRayType;
};

// vehicle Inner
