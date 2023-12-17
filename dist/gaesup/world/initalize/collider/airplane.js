import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../../utils/context";
export function airplane(_a) {
    var gltf = _a.gltf, value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    if (!url || !url.airplaneUrl)
        return;
    var airplaneSize = gltf.airplaneSize;
    useEffect(function () {
        if (isVectorNonZero(airplaneSize)) {
            update({
                airplaneCollider: {
                    airplaneSizeX: airplaneSize.x,
                    airplaneSizeY: airplaneSize.y,
                    airplaneSizeZ: airplaneSize.z,
                    airplaneX: airplaneSize.x / 2,
                    airplaneY: airplaneSize.y / 2,
                    airplaneZ: airplaneSize.z / 2,
                },
            }, dispatch);
        }
    }, [airplaneSize.x, airplaneSize.y, airplaneSize.z]);
}
