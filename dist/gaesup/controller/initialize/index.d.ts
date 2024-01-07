import { groundRayType, refsType, slopeRayType } from "../../controller/type";
import { cameraRayType } from "../../camera/type";
import { keyControlType } from "../../world/context/type";
export default function initControllerProps({ refs }: {
    refs: refsType;
}): {
    slopeRay: slopeRayType;
    groundRay: groundRayType;
    cameraRay: cameraRayType;
    keyControl: keyControlType;
};
