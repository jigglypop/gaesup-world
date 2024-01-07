import { useContext, useState } from "react";
import { makeCameraPosition } from "../../camera/control/orbit.js";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context/index.js";
import "./style.css";

export type zoomButtonPropsType = {
  children?: React.ReactNode;
  position: THREE.Vector3;
  target?: THREE.Vector3;
  keepBlocking?: boolean;
  zoomButtonStyle?: React.CSSProperties;
};

export function useZoom() {
  const { moveTo, activeState, cameraOption } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [isZoom, setIsZoom] = useState(true);

  const closeCamera = async (position: THREE.Vector3) => {
    cameraOption.XDistance = position.x;
    cameraOption.YDistance = position.y;
    cameraOption.ZDistance = position.z;
    dispatch({
      type: "update",
      payload: {
        cameraBlock: true,
        cameraOption: {
          ...cameraOption,
        },
      },
    });
  };

  const openCamera = async () => {
    dispatch({
      type: "update",
      payload: {
        cameraBlock: false,
      },
    });
  };

  const setZoom = async (position: THREE.Vector3, isZoom: boolean) => {
    setIsZoom(isZoom);
    await closeCamera(position);
    await moveTo(
      makeCameraPosition(activeState, cameraOption),
      activeState.position
    );
    await openCamera();
  };

  return {
    setZoom,
    openCamera,
    closeCamera,
    isZoom,
    setIsZoom,
  };
}

export function ZoomButton(props: zoomButtonPropsType) {
  const { setZoom, isZoom } = useZoom();

  return (
    <div
      className="zoomButton"
      style={props.zoomButtonStyle}
      onClick={async () => {
        await setZoom(props.position, isZoom);
      }}
    >
      {props.children}
    </div>
  );
}
