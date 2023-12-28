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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import { Suspense, useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context/index.js";
export function GaeSupProps(_a) {
    var text = _a.text, position = _a.position, jumpPoint = _a.jumpPoint, children = _a.children;
    var groupRef = useRef(null);
    var _b = useContext(GaesupWorldContext), minimap = _b.minimap, points = _b.points;
    var dispatch = useContext(GaesupWorldDispatchContext);
    useEffect(function () {
        if (jumpPoint && position) {
            points.push({
                text: text || null,
                position: vec3().set(position[0], 5, position[2]),
            });
            dispatch({
                type: "update",
                payload: {
                    points: __spreadArray([], points, true),
                },
            });
        }
        if (groupRef.current) {
            var box = new THREE.Box3().setFromObject(groupRef.current);
            var size = vec3(box.getSize(new THREE.Vector3())).clone();
            var center = vec3(box.getCenter(new THREE.Vector3())).clone();
            var obj = {
                text: text,
                size: size,
                center: center,
            };
            minimap.props[text] = obj;
            dispatch({
                type: "update",
                payload: {
                    minimap: __assign({}, minimap),
                },
            });
        }
    }, []);
    return (_jsx(Suspense, { fallback: null, children: _jsx("group", { ref: groupRef, position: position, children: children }) }));
}
