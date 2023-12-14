/// <reference types="react" />
import { dispatchType } from "../../tools/type.js";
import { gaesupControllerType, orthographicCameraType, perspectiveCameraType } from "./type.js";
export declare const gaesupControllerDefault: {
    cameraMode: perspectiveCameraType | orthographicCameraType;
    cameraOption: {
        offset: import("three").Vector3;
    };
    perspectiveCamera: {
        isFront: boolean;
        XZDistance: number;
        YDistance: number;
    };
    orthographicCamera: {
        zoom: number;
        near: number;
        far: number;
    };
    airplane: {
        angleChange: import("three").Vector3;
        maxAngle: import("three").Vector3;
        maxSpeed: number;
        accelRatio: number;
    };
    vehicle: {
        angleChange: import("three").Vector3;
        maxAngle: import("three").Vector3;
        maxSpeed: number;
        accelRatio: number;
    };
    character: {
        angleChange: import("three").Vector3;
        maxAngle: import("three").Vector3;
        maxSpeed: number;
        accelRatio: number;
    };
    isRider: boolean;
};
export declare const GaesupControllerContext: import("react").Context<gaesupControllerType>;
export declare const GaesupControllerDispatchContext: import("react").Context<dispatchType<gaesupControllerType>>;
