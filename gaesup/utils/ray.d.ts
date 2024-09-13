import { MutableRefObject } from "react";
import { rayType } from "../controller/type";
export declare const getRayHit: <T extends rayType>({ ray, ref, }: {
    ray: any;
    ref: MutableRefObject<any>;
}) => any;
