import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useFocus() {
    var cameraOption = useContext(GaesupWorldContext).cameraOption;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var open = function (_a) {
        var zoom = _a.zoom, target = _a.target;
        if (zoom)
            cameraOption.zoom = zoom;
        cameraOption.target = target;
        cameraOption.focus = true;
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    };
    var close = function () {
        cameraOption.focus = false;
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    };
    return {
        open: open,
        close: close,
    };
}
