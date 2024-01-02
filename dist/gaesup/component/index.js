import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import calculation from "../physics";
import { GaesupWorldContext } from "../world/context";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";
export function GaesupComponent(_a) {
    var props = _a.props, refs = _a.refs;
    var mode = useContext(GaesupWorldContext).mode;
    calculation(props);
    return (_jsxs(_Fragment, { children: [mode.type === "character" && _jsx(CharacterRef, { props: props, refs: refs }), mode.type === "vehicle" && _jsx(VehicleRef, { props: props, refs: refs }), mode.type === "airplane" && _jsx(AirplaneRef, { props: props, refs: refs })] }));
}
