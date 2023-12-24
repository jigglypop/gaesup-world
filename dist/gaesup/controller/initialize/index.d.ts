import { groundRayType, refsType, slopeRayType } from "../../controller/type";
import { cameraRayType } from "../../camera/type";
import { keyControlType } from "../../world/context/type";
import { gaesupControllerType } from "../context/type";
export default function initControllerProps({ controllerContext, refs, }: {
    controllerContext: gaesupControllerType;
    refs: refsType;
}): {
    slopeRay: slopeRayType;
    groundRay: groundRayType;
    cameraRay: cameraRayType;
    keyControl: keyControlType;
};
