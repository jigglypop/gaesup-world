import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef } from "react";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
export const VehicleWheelCollider = forwardRef(({ wheelUrl, vehicleSize }, ref) => {
    const { size: wheelSize } = useGltfAndSize({
        url: wheelUrl,
    });
    return (_jsx(CuboidCollider, { ref: ref, args: [
            vehicleSize.x / 2,
            vehicleSize.y / 2 - wheelSize.y / 2,
            vehicleSize.z / 2,
        ], position: [0, vehicleSize.y / 2 + wheelSize.y / 2, 0] }));
});
export const VehicleCollider = forwardRef(({ vehicleSize }, ref) => {
    return (_jsx(CuboidCollider, { ref: ref, args: [vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2], position: [0, vehicleSize.y / 2, 0] }));
});
