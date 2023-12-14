import { useEffect } from "react";
export function vehicle(_a) {
    var gltf = _a.gltf, value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    if (!url || !url.vehicleUrl)
        return;
    var vehicleSize = gltf.vehicleSize, wheelSize = gltf.wheelSize;
    useEffect(function () {
        if (vehicleSize.x !== 0 &&
            vehicleSize.y !== 0 &&
            vehicleSize.z !== 0 &&
            wheelSize.x !== 0 &&
            wheelSize.y !== 0 &&
            wheelSize.z !== 0) {
            dispatch({
                type: "update",
                payload: {
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
                },
            });
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
