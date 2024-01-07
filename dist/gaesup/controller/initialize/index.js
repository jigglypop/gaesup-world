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
import { useKeyboardControls } from "@react-three/drei";
import { vec3 } from "@react-three/rapier";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { update } from "../../utils/context";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export default function initControllerProps(_a) {
    var refs = _a.refs;
    var context = useContext(GaesupWorldContext);
    var dispatch = useContext(GaesupWorldDispatchContext);
    var _b = useKeyboardControls(), _ = _b[0], getKeys = _b[1];
    var keyControl = getKeys();
    useEffect(function () {
        if (context && keyControl && context.control) {
            dispatch({
                type: "update",
                payload: {
                    control: __assign({}, (context.mode.controller === "keyboard"
                        ? keyControl
                        : context.control)),
                },
            });
        }
    }, [context === null || context === void 0 ? void 0 : context.mode.controller, keyControl, context === null || context === void 0 ? void 0 : context.control]);
    var groundRay = useMemo(function () {
        return {
            origin: vec3(),
            dir: vec3({ x: 0, y: -1, z: 0 }),
            offset: vec3({ x: 0, y: -context.characterCollider.halfHeight, z: 0 }),
            hit: null,
            parent: null,
            rayCast: null,
            length: 0.5,
        };
    }, []);
    var slopeRay = useMemo(function () {
        return {
            current: vec3(),
            origin: vec3(),
            hit: null,
            rayCast: null,
            dir: vec3({ x: 0, y: -1, z: 0 }),
            offset: vec3({ x: 0, y: 0, z: context.characterCollider.radius - 0.03 }),
            length: context.characterCollider.radius + 3,
            angle: 0,
        };
    }, []);
    var cameraRay = useMemo(function () {
        return {
            origin: vec3(),
            hit: new THREE.Raycaster(),
            rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
            dir: vec3(),
            position: vec3(),
            length: -context.cameraOption.maxDistance,
            detected: [],
            intersects: [],
            intersectObjectMap: {},
        };
    }, []);
    var initRefs = useCallback(function (refs) {
        update({
            refs: __assign({}, refs),
        }, dispatch);
    }, [refs]);
    useEffect(function () {
        if (refs) {
            initRefs(refs);
        }
    }, []);
    return {
        slopeRay: slopeRay,
        groundRay: groundRay,
        cameraRay: cameraRay,
        keyControl: keyControl,
    };
}
