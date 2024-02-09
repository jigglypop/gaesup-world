import { Ref } from "react";
import { AnimationAction, AnimationClip, AnimationMixer, Object3D, Object3DEventMap } from "three";
import { groundRayType } from "../controller/type";
export type Api<T extends AnimationClip> = {
    ref: React.MutableRefObject<Object3D | undefined | null>;
    clips: AnimationClip[];
    mixer: AnimationMixer;
    names: T["name"][];
    actions: {
        [key in T["name"]]: AnimationAction | null;
    };
};
export type playActionsType = {
    type: "character" | "vehicle" | "airplane";
    animationResult: Api<AnimationClip>;
    currentAnimation?: string;
};
export type subscribeActionsType = {
    type: "character" | "vehicle" | "airplane";
    groundRay: groundRayType;
    animations: AnimationClip[];
};
export type actionsType = {
    [x: string]: THREE.AnimationAction | null;
};
export type playResultType = {
    actions: actionsType;
    ref: Ref<Object3D<Object3DEventMap>>;
};
export declare function subscribeActions({ type, groundRay, animations, }: subscribeActionsType): {
    animationResult: {
        ref: import("react").MutableRefObject<Object3D<Object3DEventMap>>;
        clips: AnimationClip[];
        mixer: AnimationMixer;
        names: string[];
        actions: {
            [x: string]: AnimationAction;
        };
    };
};
export default function playActions({ type, animationResult, currentAnimation, }: playActionsType): {
    animationRef: import("react").MutableRefObject<Object3D<Object3DEventMap>>;
    currentAnimation: string;
};
export declare const setAnimation: ({ currentAnimation, actions, type, }: {
    currentAnimation?: string;
    actions?: actionsType;
    type?: "character" | "vehicle" | "airplane";
}) => void;
