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
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { GaesupWorldContext } from "../world/context";
import normal from "./control/normal";
import orbit from "./control/orbit";
export default function Camera(_a) {
    var refs = _a.refs, prop = _a.prop, control = _a.control;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var mode = worldContext.mode;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef;
    var scene = useThree().scene;
    var state = useThree();
    var cameraControlsRef = useRef();
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
        cameraProp.delta = delta;
        if (mode.control === "orbit") {
            orbit(cameraProp);
        }
        else if (mode.control === "normal") {
            normal(cameraProp);
        }
    });
    useEffect(function () {
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current)
            return;
        cameraProp.state = state;
        if (mode.control === "orbit") {
            orbit(cameraProp);
        }
        else if (mode.control === "normal") {
            normal(cameraProp);
        }
    }, [cameraProp, mode.control, state]);
    return (_jsx(_Fragment, { children: _jsx(CameraControls, { ref: cameraControlsRef }) }));
}
