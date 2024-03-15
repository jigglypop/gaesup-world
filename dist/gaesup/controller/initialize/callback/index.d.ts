import { Api } from "../../../animation/actions";
import { controllerInnerType } from "../../type";
export default function initCallback({ props, animationResult, type, }: {
    props: controllerInnerType;
    animationResult: Api<THREE.AnimationClip>;
    type: "character" | "vehicle" | "airplane";
}): void;
