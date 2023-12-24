/// <reference types="react" />
import * as THREE from "three";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
export type InnerGroupRefType = {
    props: gaesupPassivePropsType;
    url: string;
};
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<InnerGroupRefType & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
