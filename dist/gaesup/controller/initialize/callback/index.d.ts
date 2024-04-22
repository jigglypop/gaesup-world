import * as THREE from "three";
import { Api } from "../../../animation/actions";
import { animationTagType } from "../../type";
export default function initCallback({ animationResult, type, }: {
    animationResult: Api<THREE.AnimationClip>;
    type: "character" | "vehicle" | "airplane";
}): {
    subscribe: ({ tag, condition, action, animationName, key, }: import("../../../world/context/type").animationAtomType) => void;
    playAnimation: (tag: keyof animationTagType, key: string) => void;
    dispatch: import("../../../utils/type").dispatchType<Partial<import("../../../world/context/type").gaesupWorldContextType>>;
};
