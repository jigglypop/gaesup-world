import { MutableRefObject } from "react";
import * as THREE from "three";
export type InnerGroupRefType = {
    children?: React.ReactNode;
    objectNode: THREE.Object3D;
    animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
    nodes: {
        [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
    };
};
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<InnerGroupRefType & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
