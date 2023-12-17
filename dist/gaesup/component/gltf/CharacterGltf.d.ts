/// <reference types="react" />
import { controllerInnerType, groundRayType, refsType } from "../../controller/type";
import { callbackType } from "../../initial/callback/type";
export type characterGltfType = {
    props: controllerInnerType;
    groundRay: groundRayType;
    refs: refsType;
    callbacks?: callbackType;
};
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<import("react").RefAttributes<import("three").Group<import("three").Object3DEventMap>>>;
export declare const CharacterInnerGroupRef: import("react").ForwardRefExoticComponent<characterGltfType & import("react").RefAttributes<import("three").Group<import("three").Object3DEventMap>>>;
