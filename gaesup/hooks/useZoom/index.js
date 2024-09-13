import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useZoom() {
    const { cameraOption } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const zoom = (zoom) => {
        cameraOption.zoom = zoom;
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    };
    return {
        zoom,
    };
}
