import { RootState } from "@react-three/fiber";

import { joyStickInnerType } from "../../tools/joystick/type";
import { V3, calcAngleByVector } from "../../utils/vector";
import { activeStateType, modeType } from "../../world/context/type";
import { calcPropType } from "../type";

export function orbitDirection({
  activeState,
  control,
  mode,
  joystick,
  state,
}: {
  state: RootState;
  activeState: activeStateType;
  mode: modeType;
  joystick: joyStickInnerType;
  control: {
    [key: string]: boolean;
  };
}) {
  const { forward, backward, leftward, rightward } = control;
  let start = 0;
  if (mode.controller === "joystick") {
    if (!joystick.joyStickOrigin.isCenter)
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
  mode: modeType;
  joystick: joyStickInnerType;
  control: {
    [key: string]: boolean;
  };
}) {
  const { forward, backward, leftward, rightward } = control;
  let start = 0;
  if (mode.controller === "joystick") {
    if (!joystick.joyStickOrigin.isCenter)
      activeState.euler.y =
        -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
    start = joystick.joyStickOrigin.isOn ? 1 : 0;
  } else {
    // 일반 컨트롤
    // right hand rule. north -> east -> south -> west
    const dirX = Number(leftward) - Number(rightward);
    const dirZ = Number(forward) - Number(backward);
    if (dirX === 0 && dirZ === 0) return;
    const dir = V3(dirX, 0, dirZ);
    const angle = calcAngleByVector(dir);
    activeState.euler.y = angle;
    activeState.dir.set(dirX, 0, dirZ);
  }
}

export default function direction(prop: calcPropType) {
  const {
    state,
    worldContext: { joystick, mode, activeState, control },
    controllerContext: { cameraMode },
  } = prop;
  if (cameraMode.controlType === "normal") {
    normalDirection({ activeState, control, mode, joystick, state });
  } else if (cameraMode.controlType === "orbit") {
    orbitDirection({ activeState, control, mode, joystick, state });
  }
}
