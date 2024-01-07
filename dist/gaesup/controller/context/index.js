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
    airplane: {
        angleDelta: V3(Math.PI / 256, Math.PI / 256, Math.PI / 256),
        maxAngle: V3(Math.PI / 8, Math.PI / 8, Math.PI / 8),
        maxSpeed: 60,
        accelRatio: 2,
        brakeRatio: 5,
        buoyancy: 0.2,
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
        walkSpeed: 10,
        runSpeed: 20,
        turnSpeed: 10,
        jumpSpeed: 1,
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
    },
    isRider: false,
};
export var GaesupControllerContext = createContext(__assign({}, gaesupControllerDefault));
export var GaesupControllerDispatchContext = createContext(null);
