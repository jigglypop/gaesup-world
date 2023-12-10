import { calcPropType } from "../type";

export default function moving(prop: calcPropType) {
  const {
    control: calcControl,
    worldContext: { states, joystick, mode },
  } = prop;
  const { forward, backward, leftward, rightward, shift, space } = calcControl;
  if (mode.controller === "gameboy" || mode.controller === "keyboard") {
    states.isMoving = forward || backward || leftward || rightward;
    states.isNotMoving = !states.isMoving;
    states.isRunning = shift && states.isMoving;
    states.isJumping = space;
  } else if (mode.controller === "joystick") {
    states.isMoving = joystick.joyStickOrigin.isOn;
    states.isNotMoving = !joystick.joyStickOrigin.isOn;
    states.isRunning =
      joystick.joyStickOrigin.isOn && joystick.joyStickOrigin.isIn;
    states.isJumping = space;
  }
}
