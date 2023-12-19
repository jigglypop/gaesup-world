/// <reference types="react" />
import { groundRayType } from "../controller/type";
export type playActionsType = {
    groundRay: groundRayType;
    isRider?: boolean;
};
export default function playActions({ groundRay, isRider }: playActionsType): {
    animationRef: import("react").MutableRefObject<import("three").Object3D<import("three").Object3DEventMap>>;
};
