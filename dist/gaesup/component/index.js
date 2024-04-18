import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import calculation from "../physics";
import { GaesupWorldContext } from "../world/context";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";
export function GaesupComponent(_a) {
    var props = _a.props, refs = _a.refs, urls = _a.urls;
    var _b = useContext(GaesupWorldContext), mode = _b.mode, states = _b.states, rideable = _b.rideable;
    var enableRiding = states.enableRiding, isRiderOn = states.isRiderOn, rideableId = states.rideableId;
    calculation(props);
    return (_jsxs(_Fragment, { children: [mode.type === "character" && (_jsx(CharacterRef, { props: props, refs: refs, urls: urls })), mode.type === "vehicle" && (_jsx(VehicleRef, { props: props, groundRay: props.groundRay, refs: refs, urls: urls, enableRiding: enableRiding, isRiderOn: isRiderOn, offset: rideableId && rideable[rideableId]
                    ? rideable[rideableId].offset
                    : vec3(), children: props.children })), mode.type === "airplane" && (_jsx(AirplaneRef, { props: props, groundRay: props.groundRay, refs: refs, urls: urls, enableRiding: enableRiding, isRiderOn: isRiderOn, offset: rideableId && rideable[rideableId]
                    ? rideable[rideableId].offset
                    : vec3(), children: props.children }))] }));
}
