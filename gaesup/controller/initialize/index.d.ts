import { groundRayType, refsType } from "../../controller/type";
import { cameraRayType } from "../../camera/type";
export default function initControllerProps(props: {
    refs: refsType;
}): {
    groundRay: groundRayType;
    cameraRay: cameraRayType;
};
