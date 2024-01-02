import { buttonGroup, useControls } from "leva";
import { useEffect } from "react";
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { cameraOptionType, gaesupWorldContextType } from "../context/type";
import { innerDebugPropType } from "../initalize/type";
import { cameraOptionDebugMap } from "./cameraOption";

export default function initDebug({ value, dispatch }: innerDebugPropType) {
  const { debug: worldDebug } = value;
  if (!worldDebug) return;

  const [type, setType] = useControls(() => ({
    type: value.mode.type,
    " ": buttonGroup({
      character: () => setType({ type: "character" }),
      airplane: () => setType({ type: "airplane" }),
      vehicle: () => setType({ type: "vehicle" }),
    }),
  }));

  const [controller, controllerSet] = useControls(() => ({
    controller: value.mode.controller,
    "  ": buttonGroup({
      joystick: () => controllerSet({ controller: "joystick" }),
      keyboard: () => controllerSet({ controller: "keyboard" }),
      gameboy: () => controllerSet({ controller: "gameboy" }),
    }),
  }));

  const cameraOptionValue = debug<cameraOptionType>({
    debug: worldDebug,
    debugProps: value.cameraOption,
    tag: "cameraOption",
    debugMap: cameraOptionDebugMap,
  });

  useEffect(() => {
    update<gaesupWorldContextType>(
      {
        mode: {
          type: type.type,
          controller: controller.controller,
          control: value.mode.control,
        },
        cameraOption: {
          ...cameraOptionValue,
        },
      },
      dispatch
    );
  }, [type, controller, cameraOptionValue]);
}
