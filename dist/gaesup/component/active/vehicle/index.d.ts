import { ReactNode } from "react";
import * as THREE from "three";
import { refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
export declare function VehicleRef({ children, enableRiding, isRiderOn, offset, refs, urls, }: {
    children: ReactNode;
    enableRiding?: boolean;
    isRiderOn?: boolean;
    offset?: THREE.Vector3;
    refs: refsType;
    urls: urlsType;
}): import("react/jsx-runtime").JSX.Element;
