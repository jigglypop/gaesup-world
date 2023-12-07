import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import useCalcControl from "../stores/control";
import { joyStickOriginAtom } from "../stores/joystick";
import { statesAtom } from "../stores/states";
import { propType } from "../type";

export default function checkMoving(prop: propType) {
  const states = useAtomValue(statesAtom);
  const joyStick = useAtomValue(joyStickOriginAtom);
  const { options } = prop;
  const { forward, backward, leftward, rightward, shift, space, control } =
    useCalcControl(prop);
  useFrame(() => {
    const { controllerType } = options;
    if (
      controllerType === "none" ||
      controllerType === "gameboy" ||
      controllerType === "keyboard"
    ) {
      states.isMoving = forward || backward || leftward || rightward;
      states.isNotMoving = !states.isMoving;
      states.isRunning = shift && states.isMoving;
      states.isJumping = control;
    } else if (controllerType === "joystick") {
      states.isMoving = joyStick.isOn;
      states.isNotMoving = !joyStick.isOn;
      states.isRunning = joyStick.isOn && joyStick.isIn;
      states.isJumping = control;
    }
  });
}
