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
import { V3 } from "../../utils";
import { update } from "../../utils/context";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export default function initControllerProps(props) {
    var context = useContext(GaesupWorldContext);
    var dispatch = useContext(GaesupWorldDispatchContext);
    var _a = useKeyboardControls(), _ = _a[0], getKeys = _a[1];
    var keyControl = getKeys();
    useEffect(function () {
        if (context && keyControl && context.control) {
            // 컨트롤 정하기
            var newControl = {};
            if (context.mode.controller === "keyboard") {
                newControl = __assign({}, keyControl);
            }
            else if (context.mode.controller === "clicker") {
                if (context.mode.isButton) {
                    newControl = __assign({}, context.control);
                }
                else {
                    newControl = __assign({}, keyControl);
                }
            }
            else {
                newControl = __assign({}, context.control);
            }
            dispatch({
                type: "update",
                payload: {
                    control: __assign({}, newControl),
                },
            });
        }
    }, [context === null || context === void 0 ? void 0 : context.mode.controller, keyControl, context === null || context === void 0 ? void 0 : context.control]);
    // autoStart
    useEffect(function () {
        if (context === null || context === void 0 ? void 0 : context.clickerOption.autoStart) {
            var u = context === null || context === void 0 ? void 0 : context.activeState.position;
            var v = context === null || context === void 0 ? void 0 : context.clickerOption.queue.shift();
            if (context === null || context === void 0 ? void 0 : context.clickerOption.loop) {
                context === null || context === void 0 ? void 0 : context.clickerOption.queue.push(v);
            }
            var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
            context.clicker.angle = newAngle;
            context.clicker.point = V3(v.x, 0, v.z);
            context.clicker.isOn = true;
        }
        dispatch({
            type: "update",
            payload: {
                clicker: __assign({}, context === null || context === void 0 ? void 0 : context.clicker),
                clickerOption: __assign({}, context === null || context === void 0 ? void 0 : context.clickerOption),
            },
        });
    }, [
        context === null || context === void 0 ? void 0 : context.clicker,
        context,
        context === null || context === void 0 ? void 0 : context.clickerOption,
        context === null || context === void 0 ? void 0 : context.clickerOption.autoStart,
    ]);
    var groundRay = useMemo(function () {
        return {
            origin: vec3(),
            dir: vec3({ x: 0, y: -1, z: 0 }),
            offset: vec3({ x: 0, y: -1, z: 0 }),
            hit: null,
            parent: null,
            rayCast: null,
            length: 10,
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
    }, [props.refs]);
    useEffect(function () {
        if (props.refs) {
            initRefs(props.refs);
        }
    }, []);
    return {
        groundRay: groundRay,
        cameraRay: cameraRay,
        keyControl: keyControl,
    };
}
