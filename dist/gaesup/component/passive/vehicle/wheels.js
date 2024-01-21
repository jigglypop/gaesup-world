import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createRef, useRef } from "react";
import { WheelRegidBodyRef } from "./wheel";
export function Wheels(_a) {
    var vehicleSize = _a.vehicleSize, wheelSize = _a.wheelSize, rigidBodyRef = _a.rigidBodyRef, url = _a.url;
    var X = (vehicleSize.x - wheelSize.x) / 2 + 0.5;
    var Z = (vehicleSize.z - 2 * wheelSize.z) / 2 + 0.5;
    var wheelPositions = [
        [-X, 0, Z],
        [-X, 0, -Z],
        [X, 0, Z],
        [X, 0, -Z],
    ];
    var wheelRefs = useRef(wheelPositions.map(function () { return createRef(); }));
    return (_jsx(_Fragment, { children: wheelPositions.map(function (wheelPosition, index) { return (_jsx(WheelRegidBodyRef, { ref: wheelRefs.current[index], props: {
                wheelPosition: wheelPosition,
                bodyRef: rigidBodyRef,
                wheel: wheelRefs.current[index],
                bodyAnchor: wheelPosition,
                wheelSize: wheelSize,
                wheelAnchor: [0, 0, 0],
                rotationAxis: [1, 0, 0],
                url: url,
            } }, index)); }) }));
}
