import { buttonGroup, useControls } from "leva";
import { useEffect } from "react";
import { update } from "../../utils/context";
import { gaesupWorldContextType } from "../context/type";
import { innerDebugPropType } from "../initalize/type";

export default function initDebug({ value, dispatch }: innerDebugPropType) {
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

  useEffect(() => {
    update<gaesupWorldContextType>(
      {
        mode: { type: type.type, controller: controller.controller },
      },
      dispatch
    );
  }, [type, controller]);
}
