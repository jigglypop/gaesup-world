var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../../utils/context";
export function vehicle(_a) {
    var gltf = _a.gltf, value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    if (!url || !url.vehicleUrl)
        return;
    var vehicleSize = gltf.vehicleSize, wheelSize = gltf.wheelSize;
    useEffect(function () {
        if (isVectorNonZero(vehicleSize)) {
            var vehicleCollider = {
                vehicleSizeX: vehicleSize.x,
                vehicleSizeZ: vehicleSize.z,
                vehicleX: vehicleSize.x / 2,
                vehicleZ: vehicleSize.z / 2,
            };
            if (url.wheelUrl && isVectorNonZero(wheelSize)) {
                vehicleCollider.vehicleSizeY = wheelSize.y / 2;
                vehicleCollider.vehicleY = wheelSize.y;
                vehicleCollider.wheelSizeX = wheelSize.x;
                vehicleCollider.wheelSizeY = wheelSize.y;
                vehicleCollider.wheelSizeZ = wheelSize.z;
                update({
                    vehicleCollider: __assign({}, vehicleCollider),
                }, dispatch);
            }
            else {
                vehicleCollider.vehicleSizeY = vehicleSize.y;
                vehicleCollider.vehicleY = vehicleSize.y;
                update({
                    vehicleCollider: __assign({}, vehicleCollider),
                }, dispatch);
            }
        }
    }, [
        vehicleSize.x,
        vehicleSize.y,
        vehicleSize.z,
        wheelSize === null || wheelSize === void 0 ? void 0 : wheelSize.x,
        wheelSize === null || wheelSize === void 0 ? void 0 : wheelSize.y,
        wheelSize === null || wheelSize === void 0 ? void 0 : wheelSize.z,
    ]);
}
