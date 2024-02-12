import { RootState } from "@react-three/fiber";
import { cameraRayType } from "../../../camera/type";
import { activeStateType, animationAtomType, animationStateType, keyControlType, statesType } from "../../../world/context/type";
import { actionsType, groundRayType } from "../../type";
export type callbackPropType = {
    activeState: activeStateType;
    states: statesType;
    groundRay: groundRayType;
    cameraRay: cameraRayType;
    control: keyControlType;
    subscribe: (props: animationAtomType) => void;
};
export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
    actions: {
        [x: string]: THREE.AnimationAction | null;
    };
    animationState: animationStateType;
    playAnimation: (tag: keyof actionsType, key: string) => void;
};
export type callbackType = {
    onReady?: (prop: callbackPropType) => void;
    onFrame?: (prop: onFramePropType) => void;
    onDestory?: (prop: callbackPropType) => void;
    onAnimate?: (prop: onAnimatePropType) => void;
};
