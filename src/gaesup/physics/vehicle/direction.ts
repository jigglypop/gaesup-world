import { vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function direction(prop: calcPropType) {
  const {
    worldContext: { activeState },
  } = prop;
  const { forward, backward, leftward, rightward } = prop.control;

  const start = Number(forward) - Number(backward);
  const front = vec3().set(start, 0, start);
  activeState.euler.y +=
    ((Number(leftward) - Number(rightward)) * Math.PI) / 64;
  // current.dir = V3(
  //   Math.sin(current.euler.y),
  //   0,
  //   Math.cos(current.euler.y)
  // ).normalize();
  // current.direction = front
  //   .multiply(current.dir)
  //   .multiplyScalar(shift ? accelRate : 1);
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}
