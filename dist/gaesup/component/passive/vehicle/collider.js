import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef } from "react";
export var VehicleCollider = forwardRef(function (_a, ref) {
    var collider = _a.collider, url = _a.url;
    var vehicleSizeX = collider.vehicleSizeX, vehicleSizeY = collider.vehicleSizeY, vehicleSizeZ = collider.vehicleSizeZ;
    return (_jsx(CuboidCollider, { ref: ref, args: [vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2], position: [0, vehicleSizeY + url.wheelUrl ? collider.wheelSizeY : 0, 0] }));
});
