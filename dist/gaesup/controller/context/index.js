var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { createContext } from "react";
import { V3 } from "../../utils/vector";
export var gaesupControllerDefault = {
    cameraMode: {
        cameraType: "perspective",
        controlType: "normal",
    },
    cameraOption: {
        offset: V3(-10, -10, -10),
        initDistance: -5,
        maxDistance: -7,
        minDistance: -0.7,
        initDir: 0,
        collisionOff: 0.7,
        distance: -1,
        camFollow: 11,
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
        angleDelta: V3(0.01, 0.005, 0.005),
        maxAngle: V3(0.1, 0.1, 0.1),
        maxSpeed: 60,
        accelRatio: 2,
        brakeRatio: 5,
        buoyancy: 0.5,
        linearDamping: 1,
    },
    vehicle: {
        maxSpeed: 60,
        accelRatio: 2,
        brakeRatio: 5,
        wheelOffset: 0.1,
        linearDamping: 0.5,
    },
    character: {
        walkSpeed: 4,
        runSpeed: 10,
        turnSpeed: 10,
        jumpSpeed: 5,
        linearDamping: 1,
    },
    callbacks: {
        onReady: function () { },
        onFrame: function () { },
        onDestory: function () { },
        onAnimate: function () { },
    },
    refs: {
        capsuleColliderRef: null,
        rigidBodyRef: null,
        outerGroupRef: null,
        innerGroupRef: null,
        slopeRayOriginRef: null,
        characterInnerRef: null,
        jointRefs: null,
    },
    isRider: false,
};
export var GaesupControllerContext = createContext(__assign({}, gaesupControllerDefault));
export var GaesupControllerDispatchContext = createContext(null);
