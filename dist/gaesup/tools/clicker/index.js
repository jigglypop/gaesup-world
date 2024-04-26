import { jsxs as _jsxs, Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export function Clicker(_a) {
    var onMarker = _a.onMarker, runMarker = _a.runMarker;
    var _b = useContext(GaesupWorldContext), clicker = _b.clicker, mode = _b.mode;
    return (_jsx(_Fragment, { children: mode.controller === "clicker" && (_jsxs("group", { position: clicker.point, children: [clicker.isOn && onMarker, clicker.isOn && clicker.isRun && runMarker] })) }));
}
