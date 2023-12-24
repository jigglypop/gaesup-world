import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef } from "react";
export var AirplaneCollider = forwardRef(function (_a, ref) {
    var collider = _a.collider;
    var airplaneSizeX = collider.airplaneSizeX, airplaneSizeY = collider.airplaneSizeY, airplaneSizeZ = collider.airplaneSizeZ;
    return (_jsx(CuboidCollider, { ref: ref, args: [airplaneSizeX / 2, airplaneSizeY / 2, airplaneSizeZ / 2], position: [0, airplaneSizeY / 2, 0] }));
});
