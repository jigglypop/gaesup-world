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
import { jsx as _jsx } from "react/jsx-runtime";
import { CameraControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { GaesupWorldContext } from "../world/context";
import normal, { makeNormalCameraPosition } from "./control/normal";
import orbit from "./control/orbit";
export default function Camera(_a) {
    var refs = _a.refs, prop = _a.prop, control = _a.control;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var mode = worldContext.mode, cameraOption = worldContext.cameraOption, activeState = worldContext.activeState;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef;
    var cameraRef = useRef();
    var intersectObjectMap = useMemo(function () { return ({}); }, []);
    var cameraProp = __assign(__assign({}, prop), { control: control, controllerContext: controllerContext, worldContext: worldContext, intersectObjectMap: intersectObjectMap });
    cameraProp.cameraRay.rayCast = new THREE.Raycaster(cameraProp.cameraRay.origin, cameraProp.cameraRay.dir, 0, -cameraOption.maxDistance);
    useFrame(function (state, delta) {
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current)
            return;
        cameraProp.delta = delta;
        cameraProp.state = state;
        if (!worldContext.block.camera) {
            if (mode.control === "orbit") {
                orbit(cameraProp);
            }
            else if (mode.control === "normal") {
                normal(cameraProp);
            }
        }
    });
    // zoom
    useEffect(function () {
        if (cameraRef.current) {
            cameraRef.current.zoomTo(worldContext.cameraOption.zoom, true);
        }
    }, [worldContext.cameraOption.zoom]);
    // 포커스가 아닐 때 카메라 activeStae 따라가기
    useFrame(function () {
        if (!cameraOption.focus) {
            cameraOption.target = activeState.position;
            cameraOption.position = makeNormalCameraPosition(activeState, cameraOption);
        }
    });
    return _jsx(CameraControls, { ref: cameraRef });
}
