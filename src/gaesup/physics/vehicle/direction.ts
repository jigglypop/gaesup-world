import { vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export function joystick(prop: calcPropType) {
  const {
    worldContext: { activeState, joystick },
  } = prop;
  const zAxis = joystick.joyStickOrigin.isOn ? 1 : 0;
  const front = vec3().set(zAxis, 0, zAxis);
  if (joystick.joyStickOrigin.isCenter) return front;
  activeState.euler.y = Math.PI / 2 - joystick.joyStickOrigin.angle;
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
