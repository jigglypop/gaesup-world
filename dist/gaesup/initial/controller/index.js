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
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
import initDebug from "./initDebug";
export default function initControllerProps(_a) {
    var props = _a.props, refs = _a.refs;
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
    var constant = useMemo(function () {
        return {
            jumpSpeed: 5,
            turnSpeed: 10,
            walkSpeed: 4,
            runSpeed: 10,
            accelRate: 5,
            brakeRate: 5,
            wheelOffset: 0.1,
            linearDamping: 1,
            cameraInitDistance: -5,
            cameraMaxDistance: -7,
            cameraMinDistance: -0.7,
            cameraInitDirection: 0,
            cameraCollisionOff: 0.7,
            cameraDistance: -1,
            cameraCamFollow: 11,
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
    cameraRay.rayCast = new THREE.Raycaster(cameraRay.origin, cameraRay.dir, 0, -constant.cameraMaxDistance);
    var initRefs = useCallback(function (refs) {
        dispatch({
            type: "update",
            payload: {
                refs: __assign({}, refs),
            },
        });
    }, [refs]);
    useEffect(function () {
        if (refs) {
            initRefs(refs);
        }
    }, []);
    useEffect(function () {
        if (props.constant) {
            constant = __assign(__assign({}, constant), Object.assign(constant, props.constant));
        }
    }, []);
    return initDebug({
        slopeRay: slopeRay,
        groundRay: groundRay,
        constant: constant,
        cameraRay: cameraRay,
        capsuleColliderRef: refs.capsuleColliderRef,
        rigidBodyRef: refs.rigidBodyRef,
        outerGroupRef: refs.outerGroupRef,
        slopeRayOriginRef: refs.slopeRayOriginRef,
        innerGroupRef: refs.innerGroupRef,
        keyControl: keyControl,
        debug: props.debug,
    });
}
