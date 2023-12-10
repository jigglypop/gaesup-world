import { OrthographicCameraProps } from "@react-three/fiber";
import { Dispatch, createContext } from "react";
import { dispatchType } from ".";
import { V3 } from "../../utils/vector";

export type perspectiveCameraType = {
  cameraType?: "perspective";
  controlType?: "orbit" | "normal";
};
export type orthographicCameraType = {
  cameraType?: "orthographic";
  controlType?: "orbit";
};

export type gaesupCameraPropType =
  | perspectiveCameraType
  | orthographicCameraType;

export type gaesupCameraOptionType = {
  offset?: THREE.Vector3;
};

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

export type perspectiveCameraPropType = {
  isFront: boolean;
  XZDistance: number;
  YDistance: number;
};

export type gaesupControllerType = {
  cameraMode: gaesupCameraPropType;
  cameraOption: gaesupCameraOptionType;
  perspectiveCamera: perspectiveCameraPropType;
  orthographicCamera: OrthographicCameraProps;
};

export type gaesupControllerPartialType = Partial<gaesupControllerType>;
export type gaesupDisptachType = Dispatch<{
  type: string;
  payload?: Partial<gaesupControllerType>;
}>;

export function gaesupControllerReducer(
  props: gaesupControllerType,
  action: {
    type: string;
    payload?: gaesupControllerType;
  }
) {
  switch (action.type) {
    case "init": {
      return { ...props };
    }
    case "update": {
      return { ...props, ...action.payload };
    }
  }
}

export const GaesupControllerContext =
  createContext<gaesupControllerType>(null);

export const GaesupControllerDispatchContext =
  createContext<dispatchType<gaesupControllerType>>(null);
