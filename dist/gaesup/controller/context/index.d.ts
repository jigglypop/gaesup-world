/// <reference types="react" />
import { dispatchType } from "../../utils/type";
import { gaesupControllerType } from "./type";
export declare const gaesupControllerDefault: {
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
        colliderRef: any;
        rigidBodyRef: any;
        outerGroupRef: any;
        innerGroupRef: any;
        characterInnerRef: any;
    };
};
export declare const GaesupControllerContext: import("react").Context<gaesupControllerType>;
export declare const GaesupControllerDispatchContext: import("react").Context<dispatchType<gaesupControllerType>>;
