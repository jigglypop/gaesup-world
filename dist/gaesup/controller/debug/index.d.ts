import { dispatchType } from "../../utils/type";
import { gaesupControllerType } from "../context/type";
export default function initDebug({ controllerContext, controllerDispatch, }: {
    controllerContext: gaesupControllerType;
    controllerDispatch: dispatchType<gaesupControllerType>;
}): void;
