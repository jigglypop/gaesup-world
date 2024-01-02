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
import { vec3 } from "@react-three/rapier";
import { Suspense, useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context/index.js";
export function GaeSupProps(_a) {
    var text = _a.text, position = _a.position, children = _a.children;
    var groupRef = useRef(null);
    var minimap = useContext(GaesupWorldContext).minimap;
    var dispatch = useContext(GaesupWorldDispatchContext);
    useEffect(function () {
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
