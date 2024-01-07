import { ReactNode, Ref } from "react";
import * as THREE from "three";
import { controllerInnerType, refsType } from "../../../controller/type";
import { GLTFResult } from "../../type";
export declare function WrapperRef({ children, outerChildren, props, refs, gltf, animationRef, name, }: {
    children: ReactNode;
    outerChildren?: ReactNode;
    props: controllerInnerType;
    refs: refsType;
    gltf: GLTFResult;
    animationRef?: Ref<THREE.Object3D<THREE.Object3DEventMap>>;
    name?: string;
}): import("react/jsx-runtime").JSX.Element;
