import { RefObject } from "react";
import { groundRayType } from "../controller/type";
export type playActionsType = {
    outerGroupRef: RefObject<THREE.Group>;
    groundRay: groundRayType;
    isRider?: boolean;
};
export default function playActions({ outerGroupRef, groundRay, isRider, }: playActionsType): void;
