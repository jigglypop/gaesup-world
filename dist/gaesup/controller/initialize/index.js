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
    var controllerContext = _a.controllerContext, refs = _a.refs;
    var context = useContext(GaesupWorldContext);
    var dispatch = useContext(GaesupWorldDispatchContext);
    var _b = useContext(GaesupWorldContext), control = _b.control, mode = _b.mode;
    var _c = useKeyboardControls(), _ = _c[0], getKeys = _c[1];
    var keyControl = getKeys();
    useEffect(function () {
        if (keyControl && control) {
            dispatch({
                type: "update",
                payload: {
                    control: __assign({}, (mode.controller === "keyboard" ? keyControl : control)),
                },
            });
        }
    }, [mode.controller, keyControl, control]);
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
            lerpingPoint: vec3(),
            dir: vec3(),
            position: vec3(),
            length: -1,
            followCamera: new THREE.Object3D(),
            pivot: new THREE.Object3D(),
            intersetesAndTransParented: [],
            intersects: [],
            intersectObjects: [],
            intersectObjectMap: {},
        };
    }, []);
    cameraRay.rayCast = new THREE.Raycaster(cameraRay.origin, cameraRay.dir, 0, -controllerContext.cameraOption.maxDistance);
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
