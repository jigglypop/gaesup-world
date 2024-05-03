import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Line } from "@react-three/drei";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export function Clicker(_a) {
    var onMarker = _a.onMarker, runMarker = _a.runMarker;
    var _b = useContext(GaesupWorldContext), clicker = _b.clicker, mode = _b.mode, clickerOption = _b.clickerOption;
    return (_jsxs(_Fragment, { children: [mode.controller === "clicker" && (_jsxs("group", { position: clicker.point, children: [clicker.isOn && onMarker, clicker.isOn && clickerOption.isRun && clicker.isRun && runMarker] })), clickerOption.line &&
                clickerOption.queue.map(function (item, key) {
                    return (_jsxs("group", { position: [0, 1, 0], children: [key >= 1 && (_jsx(Line, { worldUnits: true, points: [
                                    clickerOption.queue[key - 1],
                                    clickerOption.queue[key],
                                ], color: "turquoise", transparent: true, opacity: 0.5, lineWidth: 0.4 })), _jsxs("mesh", { position: item, children: [_jsx("sphereGeometry", { args: [0.6, 30, 0.6] }), _jsx("meshStandardMaterial", { color: "turquoise", transparent: true, opacity: 0.8 })] }, key)] }));
                })] }));
}
