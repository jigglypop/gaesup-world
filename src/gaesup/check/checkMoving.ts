import { checkPropType } from ".";

export default function checkMoving(prop: checkPropType) {
  const { control: calcControl, option } = prop;
  const [options] = option;
  const [states] = prop.states;
  const [joyStick] = prop.joystick;
  const { forward, backward, leftward, rightward, shift, control } =
    calcControl;
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
}
