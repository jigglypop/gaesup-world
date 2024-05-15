import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Line } from "@react-three/drei";
import { useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext } from "../../world/context";
export function Clicker(_a) {
    var onMarker = _a.onMarker, runMarker = _a.runMarker;
    var _b = useContext(GaesupWorldContext), clicker = _b.clicker, mode = _b.mode, clickerOption = _b.clickerOption;
    var pointQ = [];
    for (var i = 0; i < clickerOption.queue.length; i++) {
        if (clickerOption.queue[i] instanceof THREE.Vector3) {
            pointQ.push(clickerOption.queue[i]);
        }
    }
    return (_jsxs(_Fragment, { children: [mode.controller === "clicker" && (_jsxs("group", { position: clicker.point, children: [clicker.isOn && onMarker, clicker.isOn && clickerOption.isRun && clicker.isRun && runMarker] })), clickerOption.line &&
                pointQ.map(function (queueItem, key) {
                    if (queueItem instanceof THREE.Vector3) {
                        var current = key;
                        var before = key === 0 ? pointQ.length - 1 : key - 1;
                        return (_jsxs("group", { position: [0, 1, 0], children: [_jsx(Line, { worldUnits: true, points: [pointQ[before], pointQ[current]], color: "turquoise", transparent: true, opacity: 0.5, lineWidth: 0.4 }), _jsxs("mesh", { position: queueItem, children: [_jsx("sphereGeometry", { args: [0.6, 30, 0.6] }), _jsx("meshStandardMaterial", { color: "turquoise", transparent: true, opacity: 0.8 })] }, key)] }, key));
                    }
                })] }));
}
