/// <reference types="react" />
import { AnimationClip } from "three";
export type playPassiveActionsType = {
    current: string;
    animations: AnimationClip[];
};
export default function playPassiveActions({ current, animations, }: playPassiveActionsType): {
    animationRef: import("react").MutableRefObject<import("three").Object3D<import("three").Object3DEventMap>>;
};
