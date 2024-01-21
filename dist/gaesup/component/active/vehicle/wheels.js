import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createRef, useContext, useRef } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { WheelRegidBodyRef } from "./wheel";
export function Wheels(_a) {
    var props = _a.props;
    var rigidBodyRef = props.rigidBodyRef;
    var _b = useContext(GaesupWorldContext), collider = _b.vehicleCollider, activeState = _b.activeState;
    var vehicleSizeX = collider.vehicleSizeX, vehicleSizeZ = collider.vehicleSizeZ, wheelSizeX = collider.wheelSizeX, wheelSizeZ = collider.wheelSizeZ;
    var X = (vehicleSizeX - wheelSizeX) / 2 + 0.5;
    var Z = (vehicleSizeZ - 2 * wheelSizeZ) / 2 + 0.5;
    var wheelPositions = [
        [-X, 0, Z],
        [-X, 0, -Z],
        [X, 0, Z],
        [X, 0, -Z],
    ];
    var wheelRefs = useRef(wheelPositions.map(function () { return createRef(); }));
    return (_jsx(_Fragment, { children: wheelPositions.map(function (wheelPosition, index) {
            return (_jsx(WheelRegidBodyRef, { index: index, ref: wheelRefs.current[index], wheelPosition: wheelPosition, bodyRef: rigidBodyRef, wheel: wheelRefs.current[index], bodyAnchor: wheelPosition, wheelAnchor: [0, 0, 0], rotationAxis: [1, 0, 0] }, index));
        }) }));
}
