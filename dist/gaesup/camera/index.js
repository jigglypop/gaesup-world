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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { MapControls, OrbitControls, OrthographicCamera, PerspectiveCamera, } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { GaesupWorldContext } from "../world/context";
import mapControl from "./control/map";
import normal from "./control/normal";
import orbit from "./control/orbit";
export default function Camera(_a) {
    var refs = _a.refs, prop = _a.prop, control = _a.control;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var cameraMode = controllerContext.cameraMode, perspectiveCamera = controllerContext.perspectiveCamera, orthographicCamera = controllerContext.orthographicCamera;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef;
    var cameraRay = prop.cameraRay;
    var _b = useThree(), camera = _b.camera, scene = _b.scene;
    var activeState = worldContext.activeState;
    var intersectObjectMap = useMemo(function () { return ({}); }, []);
    var cameraProp = __assign(__assign({}, prop), { control: control, controllerContext: controllerContext, worldContext: worldContext, intersectObjectMap: intersectObjectMap });
    var getMeshs = function (object) {
        if (object.userData && object.userData.intangible)
            return;
        if (object instanceof THREE.Mesh &&
            object.geometry.type !== "InstancedBufferGeometry") {
            intersectObjectMap[object.uuid] = object;
        }
        object.children.forEach(function (child) {
            getMeshs(child);
        });
    };
    useEffect(function () {
        scene.children.forEach(function (child) { return getMeshs(child); });
    }, []);
    useFrame(function (state, delta) {
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current)
            return null;
        cameraProp.state = state;
        cameraProp.delta = delta;
        if (cameraMode.cameraType === "perspective") {
            if (cameraMode.controlType === "orbit") {
                orbit(cameraProp);
            }
            else if (cameraMode.controlType === "normal") {
                normal(cameraProp);
            }
        }
        else if (cameraMode.cameraType === "orthographic") {
            mapControl(cameraProp);
        }
        // const distV3 = camera.position.clone().sub(activeState.position);
        // cameraRay.origin.copy(camera.position);
        // cameraRay.dir.copy(distV3.negate().normalize());
        // detector(cameraProp);
    });
    return (_jsxs(_Fragment, { children: [cameraMode.cameraType === "perspective" && (_jsxs(_Fragment, { children: [_jsx(OrbitControls, { target: activeState.position }), _jsx(PerspectiveCamera, __assign({ makeDefault: true }, perspectiveCamera))] })), cameraMode.cameraType === "orthographic" && (_jsxs(_Fragment, { children: [_jsx(MapControls, { target: activeState.position }), _jsx(OrthographicCamera, __assign({ makeDefault: true }, orthographicCamera))] }))] }));
}
