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
import { useContext, useEffect } from "react";
import { buttonGroup, useControls } from "leva";
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { GaesupWorldContext } from "../../world/context";
import { airplaneDebugMap } from "./airplane";
import { cameraOptionDebugMap } from "./cameraOption";
import { characterDebugMap } from "./character";
import { orthographicCameraDebugMap } from "./orthographicCamera";
import { perspectiveCameraDebugMap } from "./perspectiveCamera";
import { vehicleDebugMap } from "./vehicle";
export default function initDebug(_a) {
    var controllerContext = _a.controllerContext, controllerDispatch = _a.controllerDispatch;
    var worldDebug = useContext(GaesupWorldContext).debug;
    var cameraMode = controllerContext.cameraMode;
    if (!worldDebug)
        return;
    var _b = useControls(function () { return ({
        cameraType: cameraMode.cameraType,
        "   ": buttonGroup({
            perspective: function () { return setcameraType({ cameraType: "perspective" }); },
            orthographic: function () { return setcameraType({ cameraType: "orthographic" }); },
        }),
    }); }), cameraType = _b[0], setcameraType = _b[1];
    var _c = useControls(function () { return ({
        controlType: cameraMode.controlType,
        "    ": buttonGroup({
            orbit: function () { return controlTypeSet({ controlType: "orbit" }); },
            normal: function () { return controlTypeSet({ controlType: "normal" }); },
        }),
    }); }), controlType = _c[0], controlTypeSet = _c[1];
    var cameraOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.cameraOption,
        tag: "cameraOption",
        debugMap: cameraOptionDebugMap,
    });
    var characterOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.character,
        tag: "character",
        debugMap: characterDebugMap,
    });
    var vehicleOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.vehicle,
        tag: "vehicle",
        debugMap: vehicleDebugMap,
    });
    var airplaneOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.airplane,
        tag: "airplane",
        debugMap: airplaneDebugMap,
    });
    var orthographicCameraOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.orthographicCamera,
        tag: "orthographicCamera",
        debugMap: orthographicCameraDebugMap,
    });
    var perspectiveCameraOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.perspectiveCamera,
        tag: "perspectiveCamera",
        debugMap: perspectiveCameraDebugMap,
    });
    useEffect(function () {
        update({
            cameraOption: __assign({}, cameraOptionValue),
            character: __assign({}, characterOptionValue),
            vehicle: __assign({}, vehicleOptionValue),
            airplane: __assign({}, airplaneOptionValue),
            perspectiveCamera: __assign(__assign({}, controllerContext.perspectiveCamera), perspectiveCameraOptionValue),
            orthographicCamera: __assign(__assign({}, controllerContext.orthographicCamera), orthographicCameraOptionValue),
            cameraMode: {
                cameraType: cameraType.cameraType,
                controlType: controlType.controlType,
            },
        }, controllerDispatch);
    }, [
        cameraOptionValue,
        characterOptionValue,
        vehicleOptionValue,
        airplaneOptionValue,
        perspectiveCameraOptionValue,
        orthographicCameraOptionValue,
        cameraType,
        controlType,
    ]);
}
