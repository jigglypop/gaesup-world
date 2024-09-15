import { vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcType } from "../type";

export function normal(prop: calcType) {
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

export default function direction(prop: calcType) {
  const {
    worldContext: { mode, activeState },
  } = prop;
  const front = vec3();
  front.copy(normal(prop));
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}
