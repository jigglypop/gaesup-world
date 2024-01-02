import { Ref } from "react";
import { controllerInnerType } from "../../../controller/type";
import * as THREE from "three";
import { GLTFResult } from "../../type";
export type InnerGroupRefType = {
    props: controllerInnerType;
    animationRef?: Ref<THREE.Object3D<THREE.Object3DEventMap>>;
    gltf: GLTFResult;
};
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<InnerGroupRefType & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
