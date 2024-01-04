import { useContext } from "react";
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

export function ZoomButton(props: zoomButtonPropsType) {
  const { moveTo, activeState, cameraOption } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const closeCamera = async () => {
    cameraOption.XDistance = props.position.x;
    cameraOption.YDistance = props.position.y;
    cameraOption.ZDistance = props.position.z;
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

  return (
    <div
      className="zoomButton"
      style={props.zoomButtonStyle}
      onClick={async () => {
        await closeCamera();
        await moveTo(
          makeCameraPosition(activeState, cameraOption),
          activeState.position
        );
        await openCamera();
      }}
    >
      {props.children}
    </div>
  );
}
