import { refsType } from "../../../controller/type";
import { RigidBodyTypeString } from "@react-three/rapier";
import { ReactNode, Ref } from "react";
import * as THREE from "three";
import { Object3D, Object3DEventMap } from "three";
import { urlsType } from "../../../world/context/type";
export declare const calcCharacterColliderProps: (characterSize: THREE.Vector3) => {
    height: number;
    halfHeight: number;
    radius: number;
    diameter: number;
};
export type characterColliderType = {
    height: number;
    halfHeight: number;
    radius: number;
    diameter: number;
};
export declare function CharacterInnerRef({ children, refs, urls, position, euler, currentAnimation, positionLerp, type, }: {
    children: ReactNode;
    refs: Partial<refsType>;
    urls: urlsType;
    position?: THREE.Vector3;
    euler?: THREE.Euler;
    animationRef?: Ref<Object3D<Object3DEventMap>>;
    currentAnimation?: string;
    positionLerp?: number;
    type?: RigidBodyTypeString;
}): import("react/jsx-runtime").JSX.Element;
