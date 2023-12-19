/// <reference types="react" />
import { dispatchType } from "../../utils/type";
import { gaesupControllerType, orthographicCameraType, perspectiveCameraType } from "./type";
export declare const gaesupControllerDefault: {
    cameraMode: perspectiveCameraType | orthographicCameraType;
    cameraOption: {
        offset: import("three").Vector3;
        initDistance: number;
        maxDistance: number;
        minDistance: number;
        initDir: number;
        collisionOff: number;
        distance: number;
        camFollow: number;
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
        angleDelta: import("three").Vector3;
        maxAngle: import("three").Vector3;
        maxSpeed: number;
        accelRatio: number;
        brakeRatio: number;
        buoyancy: number;
        linearDamping: number;
    };
    vehicle: {
        maxSpeed: number;
        accelRatio: number;
        brakeRatio: number;
        wheelOffset: number;
        linearDamping: number;
    };
    character: {
        walkSpeed: number;
        runSpeed: number;
        turnSpeed: number;
        jumpSpeed: number;
        linearDamping: number;
    };
    callbacks: {
        onReady: () => void;
        onFrame: () => void;
        onDestory: () => void;
        onAnimate: () => void;
    };
    refs: {
        capsuleColliderRef: any;
        rigidBodyRef: any;
        outerGroupRef: any;
        innerGroupRef: any;
        slopeRayOriginRef: any;
        characterInnerRef: any;
        jointRefs: any;
    };
    isRider: boolean;
};
export declare const GaesupControllerContext: import("react").Context<gaesupControllerType>;
export declare const GaesupControllerDispatchContext: import("react").Context<dispatchType<gaesupControllerType>>;
