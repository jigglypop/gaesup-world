import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { GaesupWorldContext } from "../world/context";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";
export function GaesupComponent({ props, refs, }) {
    const { mode, states, rideable, urls } = useContext(GaesupWorldContext);
    const { enableRiding, isRiderOn, rideableId } = states;
    return (_jsxs(_Fragment, { children: [mode.type === "character" && (_jsx(CharacterRef, { props: props, refs: refs, urls: urls, children: props.children })), mode.type === "vehicle" && (_jsx(VehicleRef, Object.assign({ controllerOptions: props.controllerOptions, url: urls.vehicleUrl, wheelUrl: urls.wheelUrl, ridingUrl: urls.ridingUrl, enableRiding: enableRiding, isRiderOn: isRiderOn, groundRay: props.groundRay, offset: rideableId && rideable[rideableId]
                    ? rideable[rideableId].offset
                    : vec3() }, refs, { children: props.children }))), mode.type === "airplane" && (_jsx(AirplaneRef, Object.assign({ controllerOptions: props.controllerOptions, url: urls.airplaneUrl, ridingUrl: urls.ridingUrl, enableRiding: enableRiding, isRiderOn: isRiderOn, groundRay: props.groundRay, offset: rideableId && rideable[rideableId]
                    ? rideable[rideableId].offset
                    : vec3() }, refs, { children: props.children })))] }));
}
