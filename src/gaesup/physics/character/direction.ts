import { RootState } from "@react-three/fiber";
import { activeStateType } from "../../stores/active/type";
import { gaesupControllerPropType } from "../../stores/context";
import { joyStickType } from "../../stores/joystick";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export function joystickDirection() {}

export function orbitDirection({
  activeState,
  control,
  mode,
  joystick,
  state,
}: {
  state: RootState;
  activeState: activeStateType;
  mode: gaesupControllerPropType;
  joystick: joyStickType;
  control: {
    [key: string]: boolean;
  };
}) {
  const { forward, backward, leftward, rightward } = control;
  let start = 0;
  if (mode.controller === "joystick") {
    activeState.euler.y =
      -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
    start = joystick.joyStickOrigin.isOn ? 1 : 0;
  } else {
    activeState.euler.y +=
      ((Number(leftward) - Number(rightward)) * Math.PI) / 32;
    start = Number(forward) - Number(backward);
  }
  const front = V3(start, 0, start);
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}

export function normalDirection({
  activeState,
  control,
  mode,
  joystick,
  state,
}: {
  state: RootState;
  activeState: activeStateType;
  mode: gaesupControllerPropType;
  joystick: joyStickType;
  control: {
    [key: string]: boolean;
  };
}) {
  const { forward, backward, leftward, rightward } = control;
  let start = 0;
  if (mode.controller === "joystick") {
    activeState.euler.y =
      -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
    start = joystick.joyStickOrigin.isOn ? 1 : 0;
  } else {
    if (forward) {
      activeState.euler.y =
        -state.camera.rotation.y +
        (leftward ? Math.PI / 4 : 0) -
        (rightward ? Math.PI / 4 : 0);
    } else if (backward) {
      activeState.euler.y =
        -state.camera.rotation.y +
        Math.PI -
        (leftward ? Math.PI / 4 : 0) +
        (rightward ? Math.PI / 4 : 0);
    } else if (leftward) {
      activeState.euler.y = -state.camera.rotation.y + Math.PI / 2;
    } else if (rightward) {
      activeState.euler.y = -state.camera.rotation.y - Math.PI / 2;
    }
  }
  const front = V3(
    Number(backward) - Number(forward),
    0,
    Number(leftward) - Number(rightward)
  );
  activeState.direction = front;
  activeState.dir = activeState.direction.normalize();
}

export default function direction(prop: calcPropType) {
  const {
    control,
    state,
    worldContext: { joystick, mode, activeState },
    controllerContext: { cameraMode },
  } = prop;
  if (cameraMode.controlType === "normal") {
    normalDirection({ activeState, control, mode, joystick, state });
  } else if (cameraMode.controlType === "orbit") {
    orbitDirection({ activeState, control, mode, joystick, state });
  }
}
