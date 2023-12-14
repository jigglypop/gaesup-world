import { RootState } from "@react-three/fiber";
import { propType } from "../controller/type";
import { World } from "@dimforge/rapier3d-compat";
import { gaesupControllerType } from "../controller/context/type";
import { dispatchType, gaesupWorldPropType } from "../world/context/type";
export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;
export type calcPropType = propType & {
    state?: RootState;
    checkCollision?: (delta: number) => void;
    worldContext?: gaesupWorldPropType;
    controllerContext?: gaesupControllerType;
    delta?: number;
    dispatch?: dispatchType<gaesupWorldPropType>;
    world: World;
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
