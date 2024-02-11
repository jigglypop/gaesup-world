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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
export function InnerHtml(_a) {
    var children = _a.children, props = __rest(_a, ["children"]);
    var ref = useRef();
    var _b = useState(), isOccluded = _b[0], setOccluded = _b[1];
    var _c = useState(), isInRange = _c[0], setInRange = _c[1];
    var isVisible = isInRange && !isOccluded;
    var vec = new THREE.Vector3();
    useFrame(function (state) {
        var range = state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= 10;
        if (range !== isInRange)
            setInRange(range);
    });
    return (_jsx("group", { ref: ref, children: _jsx(Html, __assign({ transform: true, occlude: true }, props, { children: children })) }));
}
