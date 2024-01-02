import { quat, vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export function joystick(prop: calcPropType) {
  const {
    state,
    worldContext: { activeState, control, mode, joystick },
  } = prop;
  const zAxis = joystick.joyStickOrigin.isOn ? 1 : 0;
  const front = vec3().set(zAxis, 0, zAxis);
  const _euler = activeState.euler.clone();
  const __euler = activeState.euler.clone();
  __euler.y =
    -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
  activeState.euler.setFromQuaternion(
    quat().setFromEuler(_euler).slerp(quat().setFromEuler(__euler), 0.1)
  );
  return front;
}

export function normal(prop: calcPropType) {
  const {
    worldContext: { activeState, control },
  } = prop;
  const { forward, backward, leftward, rightward } = control;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  const front = vec3().set(zAxis, 0, zAxis);
  activeState.euler.y += xAxis * (Math.PI / 64);
  return front;
}

export default function direction(prop: calcPropType) {
  const {
    worldContext: { mode, activeState },
  } = prop;
  const front = vec3();
  if (mode.controller === "joystick") front.copy(joystick(prop));
  else front.copy(normal(prop));
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}
