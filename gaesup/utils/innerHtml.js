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
    var { children } = _a, props = __rest(_a, ["children"]);
    const ref = useRef();
    const [isInRange, setInRange] = useState();
    const vec = new THREE.Vector3();
    useFrame((state) => {
        const range = state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= 10;
        if (range !== isInRange)
            setInRange(range);
    });
    return (_jsx("group", { ref: ref, children: _jsx(Html, Object.assign({ transform: true, occlude: true }, props, { children: children })) }));
}
