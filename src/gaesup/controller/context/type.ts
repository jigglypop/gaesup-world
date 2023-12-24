import { GroupProps } from "@react-three/fiber";
import { dispatchType } from "../../utils/type";
import { callbackType } from "../initialize/callback/type";
import { gaesupControllerContextPropType, refsType } from "../type";

export type airplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};

export type vehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

export type characterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
};

export interface airplaneType extends GroupProps, airplaneDebugType {}
export interface vehicleType extends GroupProps, vehicleDebugType {}
export interface characterType extends GroupProps, characterDebugType {}

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

// camera option
export type gaesupCameraOptionDebugType = {
  initDistance?: number;
  maxDistance?: number;
  minDistance?: number;
  initDir?: number;
  distance?: number;
  camFollow?: number;
};

export type cameraOptionType = {
  offset?: THREE.Vector3;
  collisionOff?: number;
} & gaesupCameraOptionDebugType;

// perspective camera
export type perspectiveCameraDebugType = {
  XZDistance?: number;
  YDistance?: number;
};
// orthographic camera
export type orthographicCameraDebugType = {
  zoom?: number;
  near?: number;
  far?: number;
};

export type perspectiveCameraPropType = {
  isFront?: boolean;
} & perspectiveCameraDebugType;

export type gaesupControllerType = gaesupControllerContextPropType & {
  callbacks?: callbackType;
  refs?: refsType;
};

export type gaesupDisptachType = dispatchType<gaesupControllerType>;
