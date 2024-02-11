import { Collider } from "@dimforge/rapier3d-compat";
import { RefObject } from "react";
import { groundRayType } from "../../../controller/type";
export type setGroundRayType = {
    groundRay: groundRayType;
    length: number;
    colliderRef: RefObject<Collider>;
};
export declare function setGroundRay({ groundRay, length, colliderRef, }: setGroundRayType): void;
