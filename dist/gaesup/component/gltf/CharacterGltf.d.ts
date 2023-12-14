/// <reference types="react" />
import { GroupProps } from "@react-three/fiber";
import { groundRayType, propType, refsType } from "../../controller/type";
import { callbackType } from "../../initial/callback/type";
export type characterGltfType = {
    prop: propType;
    groupProps?: GroupProps;
    groundRay: groundRayType;
    refs: refsType;
    callbacks?: callbackType;
    isRider?: boolean;
};
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<import("react").RefAttributes<import("three").Group<import("three").Object3DEventMap>>>;
export declare const CharacterInnerGroupRef: import("react").ForwardRefExoticComponent<characterGltfType & import("react").RefAttributes<import("three").Group<import("three").Object3DEventMap>>>;
