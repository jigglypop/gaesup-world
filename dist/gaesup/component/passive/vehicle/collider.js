import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef } from "react";
export var VehicleCollider = forwardRef(function (_a, ref) {
    var vehicleSize = _a.vehicleSize, wheelSize = _a.wheelSize;
    return (_jsx(CuboidCollider, { ref: ref, args: [vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2], position: [0, vehicleSize.y + wheelSize.y || 0, 0] }));
});
