import { RootState } from "@react-three/fiber";
import * as THREE from "three";
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
};
export type intersectObjectMapType = {
    [uuid: string]: THREE.Mesh;
};
export type cameraPropType = {
    state?: RootState;
    worldContext?: gaesupWorldContextType;
    controllerContext?: gaesupControllerType;
};
