import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef } from "react";
export var AirplaneCollider = forwardRef(function (_a, ref) {
    var airplaneSize = _a.airplaneSize;
    return (_jsx(CuboidCollider, { ref: ref, args: [airplaneSize.x / 2, airplaneSize.y / 2, airplaneSize.z / 2], position: [0, airplaneSize.y / 2, 0] }));
});
