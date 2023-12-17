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
        if (isVectorNonZero(vehicleSize) && isVectorNonZero(wheelSize)) {
            update({
                vehicleCollider: {
                    vehicleSizeX: vehicleSize.x,
                    vehicleSizeY: wheelSize.y,
                    vehicleSizeZ: vehicleSize.z,
                    wheelSizeX: wheelSize.x,
                    wheelSizeY: wheelSize.y,
                    wheelSizeZ: wheelSize.z,
                    vehicleX: vehicleSize.x / 2,
                    vehicleY: wheelSize.y / 2,
                    vehicleZ: vehicleSize.z / 2,
                },
            }, dispatch);
        }
    }, [
        vehicleSize.x,
        vehicleSize.y,
        vehicleSize.z,
        wheelSize.x,
        wheelSize.y,
        wheelSize.z,
    ]);
}
