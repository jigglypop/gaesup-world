import { createContext } from "react";
import { V3 } from "../../../utils/vector";
import { dispatchType } from "../gaesupworld/type";
import {
  gaesupControllerType,
  orthographicCameraType,
  perspectiveCameraType,
} from "./type";

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
};

export const GaesupControllerContext =
  createContext<gaesupControllerType>(null);
export const GaesupControllerDispatchContext =
  createContext<dispatchType<gaesupControllerType>>(null);
