import { useContext } from "react";

import { GaesupWorldContext } from "../../world/context/index.js";
import "./style.css";

export function ZoomCamera() {
  const { cameraState, refs, cameraOption, activeState } =
    useContext(GaesupWorldContext);
  return (
    <div
      className="zoomCamera"
      onClick={() => {
        console.log("cameraState", refs?.cameraRef?.current, cameraState);

        // refs.rigidBodyRef?.current?.setTranslation(props.position, true);
      }}
      // style={props.jumpPortalStlye}
    >
      ZOOM
    </div>
  );
}
