import { useContext, useEffect } from "react";

import { buttonGroup, useControls } from "leva";
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { dispatchType } from "../../utils/type";
import { GaesupWorldContext } from "../../world/context";
import {
  airplaneDebugType,
  cameraOptionType,
  characterDebugType,
  gaesupControllerType,
  orthographicCameraDebugType,
  perspectiveCameraDebugType,
  vehicleDebugType,
} from "../context/type";
import { airplaneDebugMap } from "./airplane";
import { cameraOptionDebugMap } from "./cameraOption";
import { characterDebugMap } from "./character";
import { orthographicCameraDebugMap } from "./orthographicCamera";
import { perspectiveCameraDebugMap } from "./perspectiveCamera";
import { vehicleDebugMap } from "./vehicle";

export default function initDebug({
  controllerContext,
  controllerDispatch,
}: {
  controllerContext: gaesupControllerType;
  controllerDispatch: dispatchType<gaesupControllerType>;
}) {
  const { debug: worldDebug } = useContext(GaesupWorldContext);
  const { cameraMode } = controllerContext;
  if (!worldDebug) return;

  const [cameraType, setcameraType] = useControls(() => ({
    cameraType: cameraMode.cameraType,
    "   ": buttonGroup({
      perspective: () => setcameraType({ cameraType: "perspective" }),
      orthographic: () => setcameraType({ cameraType: "orthographic" }),
    }),
  }));

  const [controlType, controlTypeSet] = useControls(() => ({
    controlType: cameraMode.controlType,
    "    ": buttonGroup({
      orbit: () => controlTypeSet({ controlType: "orbit" }),
      normal: () => controlTypeSet({ controlType: "normal" }),
    }),
  }));

  const cameraOptionValue = debug<cameraOptionType>({
    debug: worldDebug,
    debugProps: controllerContext.cameraOption,
    tag: "cameraOption",
    debugMap: cameraOptionDebugMap,
  });

  const characterOptionValue = debug<characterDebugType>({
    debug: worldDebug,
    debugProps: controllerContext.character,
    tag: "character",
    debugMap: characterDebugMap,
  });

  const vehicleOptionValue = debug<vehicleDebugType>({
    debug: worldDebug,
    debugProps: controllerContext.vehicle,
    tag: "vehicle",
    debugMap: vehicleDebugMap,
  });

  const airplaneOptionValue = debug<airplaneDebugType>({
    debug: worldDebug,
    debugProps: controllerContext.airplane,
    tag: "airplane",
    debugMap: airplaneDebugMap,
  });

  const orthographicCameraOptionValue = debug<orthographicCameraDebugType>({
    debug: worldDebug,
    debugProps: controllerContext.orthographicCamera,
    tag: "orthographicCamera",
    debugMap: orthographicCameraDebugMap,
  });

  const perspectiveCameraOptionValue = debug<perspectiveCameraDebugType>({
    debug: worldDebug,
    debugProps: controllerContext.perspectiveCamera,
    tag: "perspectiveCamera",
    debugMap: perspectiveCameraDebugMap,
  });

  useEffect(() => {
    update<gaesupControllerType>(
      {
        cameraOption: { ...cameraOptionValue },
        character: { ...characterOptionValue },
        vehicle: { ...vehicleOptionValue },
        airplane: { ...airplaneOptionValue },
        perspectiveCamera: {
          ...controllerContext.perspectiveCamera,
          ...perspectiveCameraOptionValue,
        },
        orthographicCamera: {
          ...controllerContext.orthographicCamera,
          ...orthographicCameraOptionValue,
        },
        cameraMode: {
          cameraType: cameraType.cameraType,
          controlType: controlType.controlType as "normal" | "orbit",
        },
      },
      controllerDispatch
    );
  }, [
    cameraOptionValue,
    characterOptionValue,
    vehicleOptionValue,
    airplaneOptionValue,
    perspectiveCameraOptionValue,
    orthographicCameraOptionValue,
    cameraType,
    controlType,
  ]);
}
