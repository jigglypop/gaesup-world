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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { GaesupWorldContext } from "../world/context";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";
export function GaesupComponent(_a) {
    var props = _a.props, refs = _a.refs, urls = _a.urls;
    var _b = useContext(GaesupWorldContext), mode = _b.mode, states = _b.states, rideable = _b.rideable;
    var enableRiding = states.enableRiding, isRiderOn = states.isRiderOn, rideableId = states.rideableId;
    return (_jsxs(_Fragment, { children: [mode.type === "character" && (_jsx(CharacterRef, { props: props, refs: refs, urls: urls })), mode.type === "vehicle" && (_jsx(VehicleRef, __assign({ controllerOptions: props.controllerOptions, url: urls.vehicleUrl, wheelUrl: urls.wheelUrl, ridingUrl: urls.ridingUrl, enableRiding: enableRiding, isRiderOn: isRiderOn, groundRay: props.groundRay, offset: rideableId && rideable[rideableId]
                    ? rideable[rideableId].offset
                    : vec3() }, refs, { children: props.children }))), mode.type === "airplane" && (_jsx(AirplaneRef, __assign({ controllerOptions: props.controllerOptions, url: urls.airplaneUrl, ridingUrl: urls.ridingUrl, enableRiding: enableRiding, isRiderOn: isRiderOn, groundRay: props.groundRay, offset: rideableId && rideable[rideableId]
                    ? rideable[rideableId].offset
                    : vec3() }, refs, { children: props.children })))] }));
}
