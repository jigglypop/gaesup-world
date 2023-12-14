import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createRef, useContext, useRef } from "react";
import { GaesupWorldContext } from "../../world/context";
import { WheelRegidBodyRef } from "../ref/vehicle";
export function Wheels(_a) {
    var prop = _a.prop;
    var rigidBodyRef = prop.rigidBodyRef, constant = prop.constant;
    var wheelOffset = constant.wheelOffset;
    var collider = useContext(GaesupWorldContext).vehicleCollider;
    var vehicleSizeX = collider.vehicleSizeX, vehicleSizeZ = collider.vehicleSizeZ, wheelSizeX = collider.wheelSizeX, wheelSizeZ = collider.wheelSizeZ;
    var X = (vehicleSizeX + wheelSizeX) / 2 + wheelOffset;
    var Z = (vehicleSizeZ + wheelSizeZ) / 2 + wheelOffset;
    var wheelPositions = [
        [-X, 0, Z],
        [-X, 0, -Z],
        [X, 0, Z],
        [X, 0, -Z],
    ];
    var wheelRefs = useRef(wheelPositions.map(function () { return createRef(); }));
    return (_jsx(_Fragment, { children: wheelPositions.map(function (wheelPosition, index) { return (_jsx(WheelRegidBodyRef, { ref: wheelRefs.current[index], wheelPosition: wheelPosition, bodyRef: rigidBodyRef, wheel: wheelRefs.current[index], bodyAnchor: wheelPosition, wheelAnchor: [0, 0, 0], rotationAxis: [1, 0, 0] }, index)); }) }));
}
