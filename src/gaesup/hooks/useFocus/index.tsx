import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useFocus() {
  const { cameraOption } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const open = ({ zoom, target }: { zoom?: number; target: THREE.Vector3 }) => {
    if (zoom) cameraOption.zoom = zoom;
    cameraOption.target = target;
    cameraOption.focus = true;
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const close = () => {
    cameraOption.focus = false;
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  return {
    open,
    close,
  };
}
