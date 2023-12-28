import { quat, vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function direction(prop: calcPropType) {
  const {
    state,
    worldContext: { activeState, control, mode, joystick },
    dispatch,
  } = prop;
  const { forward, backward, leftward, rightward } = control;

  let start = Number(backward) - Number(forward);
  if (mode.controller === "joystick") {
    if (!joystick.joyStickOrigin.isCenter)
      start = joystick.joyStickOrigin.isOn ? 1 : 0;
  }

  const front = vec3().set(start, 0, start);

  const _euler = activeState.euler.clone();
  const __euler = activeState.euler.clone();

  if (mode.controller === "joystick") {
    if (!joystick.joyStickOrigin.isCenter)
      __euler.y =
        -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
  } else {
    activeState.euler.y +=
      ((Number(leftward) - Number(rightward)) * Math.PI) / 64;
  }

  if (mode.controller === "joystick")
    activeState.euler.setFromQuaternion(
      quat()
        .setFromEuler(_euler)
        .slerp(
          quat().setFromEuler(__euler),
          joystick.joyStickOrigin.isIn ? 0.01 : 0.1
        )
    );

  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}
