import { AnimationAction } from "three";
import { rigidBodyRefType } from "../../../component/inner/common/type";
import { componentTypeString } from "../../../component/passive/type";
import { animationTagType } from "../../type";
export default function initCallback({ props, actions, componentType, }: {
    props: rigidBodyRefType;
    actions: {
        [x: string]: AnimationAction;
    };
    componentType: componentTypeString;
}): {
    subscribe: ({ tag, condition, action, animationName, key, }: import("../../../world/context/type").animationAtomType) => void;
    playAnimation: (tag: keyof animationTagType, key: string) => void;
    dispatch: import("../../../utils/type").dispatchType<Partial<import("../../../world/context/type").gaesupWorldContextType>>;
};
