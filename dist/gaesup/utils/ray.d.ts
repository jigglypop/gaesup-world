import { Collider } from "@dimforge/rapier3d-compat";
import { MutableRefObject } from "react";
import { rayType } from "../controller/type";
export declare const getRayHit: <T extends rayType>({ ray, ref, }: {
    ray: T;
    ref: MutableRefObject<Collider>;
}) => import("@dimforge/rapier3d-compat").RayColliderToi;
