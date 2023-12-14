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
import { V3 } from "../../utils/vector.js";
export var gaesupControllerDefault = {
    cameraMode: {
        cameraType: "perspective",
        controlType: "normal",
    },
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
export var GaesupControllerContext = createContext(__assign({}, gaesupControllerDefault));
export var GaesupControllerDispatchContext = createContext(null);
