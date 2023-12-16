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
  vehicleDebugType,
} from "../context/type";
import { airplaneDebugMap } from "./airplane";
import { cameraOptionDebugMap } from "./cameraOption";
import { characterDebugMap } from "./character";
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

  useEffect(() => {
    update<gaesupControllerType>(
      {
        cameraOption: { ...cameraOptionValue },
        character: { ...characterOptionValue },
        vehicle: { ...vehicleOptionValue },
        airplane: { ...airplaneOptionValue },
        cameraMode: {
          cameraType: cameraType.cameraType,
          controlType: controlType.controlType,
        },
      },
      controllerDispatch
    );
  }, [
    cameraOptionValue,
    characterOptionValue,
    vehicleOptionValue,
    airplaneOptionValue,
    cameraType,
    controlType,
  ]);
}
