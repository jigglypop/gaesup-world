import { useEffect } from "react";
import { useGltfAndSize } from "../../../utils/gltf";
export default function getGltf(_a) {
    var value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    var result = {
        characterGltf: null,
        vehicleGltf: null,
        wheelGltf: null,
        airplaneGltf: null,
        characterSize: null,
        vehicleSize: null,
        wheelSize: null,
        airplaneSize: null,
    };
    if (url.characterUrl) {
        var characterGltfAndSize = useGltfAndSize(url.characterUrl);
        result.characterGltf = characterGltfAndSize.gltf;
        result.characterSize = characterGltfAndSize.size;
    }
    if (url.vehicleUrl) {
        var vehicleAndSize = useGltfAndSize(url.vehicleUrl);
        result.vehicleGltf = vehicleAndSize.gltf;
        result.vehicleSize = vehicleAndSize.size;
        if (url.wheelUrl) {
            var wheelAndSize = useGltfAndSize(url.wheelUrl);
            result.wheelGltf = wheelAndSize.gltf;
            result.wheelSize = wheelAndSize.size;
        }
    }
    if (url.airplaneUrl) {
        var airplaneAndSize = useGltfAndSize(url.airplaneUrl);
        result.airplaneGltf = airplaneAndSize.gltf;
        result.airplaneSize = airplaneAndSize.size;
    }
    useEffect(function () {
        dispatch({
            type: "update",
            payload: {
                characterGltf: result.characterGltf,
                vehicleGltf: result.vehicleGltf,
                wheelGltf: result.wheelGltf,
                airplaneGltf: result.airplaneGltf,
            },
        });
    }, [
        url,
        result.airplaneGltf,
        result.characterGltf,
        result.vehicleGltf,
        result.wheelGltf,
    ]);
    return result;
}
