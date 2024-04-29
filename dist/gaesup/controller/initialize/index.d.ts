import { groundRayType, refsType } from "../../controller/type";
import { cameraRayType } from "../../camera/type";
import { keyControlType } from "../../world/context/type";
export default function initControllerProps(props: {
    refs: refsType;
}): {
    groundRay: groundRayType;
    cameraRay: cameraRayType;
    keyControl: keyControlType;
};
