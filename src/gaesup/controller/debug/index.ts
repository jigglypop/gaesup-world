import { useContext, useEffect } from "react";

import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { dispatchType } from "../../utils/type";
import { GaesupWorldContext } from "../../world/context";
import {
  airplaneDebugType,
  characterDebugType,
  gaesupControllerType,
  vehicleDebugType,
} from "../context/type";
import { airplaneDebugMap } from "./airplane";
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
  if (!worldDebug) return;

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
        character: { ...characterOptionValue },
        vehicle: { ...vehicleOptionValue },
        airplane: { ...airplaneOptionValue },
      },
      controllerDispatch
    );
  }, [characterOptionValue, vehicleOptionValue, airplaneOptionValue]);
}
