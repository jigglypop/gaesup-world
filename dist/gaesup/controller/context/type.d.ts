import { GroupProps, OrthographicCameraProps } from "@react-three/fiber";
import { Dispatch } from "react";
export interface airplaneType extends GroupProps {
    angleChange?: THREE.Vector3;
    maxAngle?: THREE.Vector3;
    maxSpeed?: number;
    accelRatio?: number;
}
export interface vehicleType extends GroupProps {
    angleChange?: THREE.Vector3;
    maxAngle?: THREE.Vector3;
    maxSpeed?: number;
    accelRatio?: number;
}
export interface characterType extends GroupProps {
    angleChange?: THREE.Vector3;
    maxAngle?: THREE.Vector3;
    maxSpeed?: number;
    accelRatio?: number;
}
export type perspectiveCameraType = {
    cameraType?: "perspective";
    controlType?: "orbit" | "normal";
};
export type orthographicCameraType = {
    cameraType?: "orthographic";
    controlType?: "orbit";
};
export type gaesupCameraPropType = perspectiveCameraType | orthographicCameraType;
export type gaesupCameraOptionType = {
    offset?: THREE.Vector3;
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
    airplane: airplaneType;
    vehicle: vehicleType;
    character: characterType;
    isRider: boolean;
};
export type gaesupControllerPartialType = Partial<gaesupControllerType>;
export type gaesupDisptachType = Dispatch<{
    type: string;
    payload?: Partial<gaesupControllerType>;
}>;
