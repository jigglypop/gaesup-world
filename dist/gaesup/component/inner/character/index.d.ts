import * as THREE from "three";
import { characterInnerType } from "./type";
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
export declare function CharacterInnerRef(props: characterInnerType): import("react/jsx-runtime").JSX.Element;
