import { createContext } from "react";
import { dispatchType } from "../../tools/type.js";
import { V3 } from "../../utils/vector.js";
import {
  gaesupControllerType,
  orthographicCameraType,
  perspectiveCameraType,
} from "./type.js";

export const gaesupControllerDefault = {
  cameraMode: {
    cameraType: "perspective" as "perspective",
    controlType: "normal" as "normal",
  } as perspectiveCameraType | orthographicCameraType,
  cameraOption: {
    offset: V3(-10, -10, -10),
  },
  perspectiveCamera: {
    isFront: true,
    XZDistance: 8,
    YDistance: 1,
  },
  orthographicCamera: {
    zoom: 1,
    near: 0.1,
    far: 1000,
  },
  airplane: {
    angleChange: V3(0.01, 0.005, 0.005),
    maxAngle: V3(0.1, 0.1, 0.1),
    maxSpeed: 60,
    accelRatio: 2,
  },
  vehicle: {
    angleChange: V3(0.01, 0.005, 0.005),
    maxAngle: V3(0.1, 0.1, 0.1),
    maxSpeed: 60,
    accelRatio: 2,
  },
  character: {
    angleChange: V3(0.01, 0.005, 0.005),
    maxAngle: V3(0.1, 0.1, 0.1),
    maxSpeed: 60,
    accelRatio: 2,
  },
  isRider: false,
};

export const GaesupControllerContext = createContext<gaesupControllerType>({
  ...gaesupControllerDefault,
});
export const GaesupControllerDispatchContext =
  createContext<dispatchType<gaesupControllerType>>(null);
