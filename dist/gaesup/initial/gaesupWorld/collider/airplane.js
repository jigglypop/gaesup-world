import { useEffect } from "react";
export function airplane(_a) {
    var gltf = _a.gltf, value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    if (!url || !url.airplaneUrl)
        return;
    var airplaneSize = gltf.airplaneSize;
    useEffect(function () {
        if (airplaneSize.x !== 0 && airplaneSize.y !== 0 && airplaneSize.z !== 0) {
            dispatch({
                type: "update",
                payload: {
                    airplaneCollider: {
                        airplaneSizeX: airplaneSize.x,
                        airplaneSizeY: airplaneSize.y,
                        airplaneSizeZ: airplaneSize.z,
                        airplaneX: airplaneSize.x / 2,
                        airplaneY: airplaneSize.y / 2,
                        airplaneZ: airplaneSize.z / 2,
                    },
                },
            });
        }
    }, [airplaneSize.x, airplaneSize.y, airplaneSize.z]);
}
