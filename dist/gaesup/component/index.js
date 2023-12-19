import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../world/context";
import { Airplane } from "./mode/Airplane";
import { Character } from "./mode/Character";
import { Vehicle } from "./mode/Vehicle";
export function GaesupComponent(_a) {
    var props = _a.props, refs = _a.refs;
    var mode = useContext(GaesupWorldContext).mode;
    return (_jsxs(_Fragment, { children: [mode.type === "character" && _jsx(Character, { props: props, refs: refs }), mode.type === "vehicle" && _jsx(Vehicle, { props: props, refs: refs }), mode.type === "airplane" && _jsx(Airplane, { props: props, refs: refs })] }));
}
