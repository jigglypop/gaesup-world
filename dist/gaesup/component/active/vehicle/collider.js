import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
export var VehicleCollider = forwardRef(function (_, ref) {
    var _a = useContext(GaesupWorldContext), collider = _a.vehicleCollider, url = _a.url;
    var vehicleSizeX = collider.vehicleSizeX, vehicleSizeY = collider.vehicleSizeY, vehicleSizeZ = collider.vehicleSizeZ;
    return (_jsx(_Fragment, { children: url.wheelUrl ? (_jsx(CuboidCollider, { ref: ref, args: [vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2], position: [0, vehicleSizeY + collider.wheelSizeY / 2, 0] })) : (_jsx(CuboidCollider, { ref: ref, args: [vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2], position: [0, vehicleSizeY, 0] })) }));
});
