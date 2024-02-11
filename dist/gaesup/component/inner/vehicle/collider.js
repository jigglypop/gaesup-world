import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef } from "react";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
export var VehicleWheelCollider = forwardRef(function (_a, ref) {
    var urls = _a.urls, vehicleSize = _a.vehicleSize;
    var wheelSize = useGltfAndSize({
        url: urls.wheelUrl,
    }).size;
    return (_jsx(CuboidCollider, { ref: ref, args: [
            vehicleSize.x / 2,
            vehicleSize.y / 2 - wheelSize.y / 2,
            vehicleSize.z / 2,
        ], position: [0, vehicleSize.y / 2 + wheelSize.y / 2, 0] }));
});
export var VehicleCollider = forwardRef(function (_a, ref) {
    var vehicleSize = _a.vehicleSize;
    return (_jsx(CuboidCollider, { ref: ref, args: [vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2], position: [0, vehicleSize.y / 2, 0] }));
});
