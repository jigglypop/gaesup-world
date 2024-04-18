import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useZoom() {
    var cameraOption = useContext(GaesupWorldContext).cameraOption;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var zoom = function (zoom) {
        cameraOption.zoom = zoom;
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    };
    return {
        zoom: zoom,
    };
}
