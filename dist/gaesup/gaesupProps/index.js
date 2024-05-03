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
import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { useClicker } from "../hooks/useClicker";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export function GaeSupProps(_a) {
    var _b = _a.type, type = _b === void 0 ? "normal" : _b, text = _a.text, position = _a.position, children = _a.children;
    var groupRef = useRef(null);
    var minimap = useContext(GaesupWorldContext).minimap;
    var dispatch = useContext(GaesupWorldDispatchContext);
    // clicker
    var _c = useClicker(), moveClicker = _c.moveClicker, moveDoubleClicker = _c.moveDoubleClicker;
    useEffect(function () {
        if (groupRef.current) {
            var box = new THREE.Box3().setFromObject(groupRef.current);
            var size = vec3(box.getSize(new THREE.Vector3())).clone();
            var center = vec3(box.getCenter(new THREE.Vector3())).clone();
            var obj = {
                type: type ? type : "normal",
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
    return (_jsx("group", { ref: groupRef, position: position, onPointerDown: function (e) {
            if (e.srcElement instanceof HTMLDivElement)
                return;
            moveClicker(e, false, type);
        }, onDoubleClick: function (e) {
            if (e.srcElement instanceof HTMLDivElement)
                return;
            moveDoubleClicker(e, true, type);
        }, children: children }));
}
