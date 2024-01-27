/// <reference types="react" />
import * as THREE from "three";
export type InnerGroupRefType = {
    children?: React.ReactNode;
    type: "character" | "vehicle" | "airplane";
    currentAnimation: string;
    url: string;
    rotation?: THREE.Euler;
};
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<InnerGroupRefType & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
