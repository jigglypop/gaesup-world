import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";
import { V3 } from "../../utils/vector";

export default function direction(prop: calcPropType) {
  const [current] = prop.current;
  const { forward, backward, leftward, rightward } = prop.control;

  const start = Number(forward) - Number(backward);
  const front = vec3().set(start, 0, start);
  current.euler.y += ((Number(leftward) - Number(rightward)) * Math.PI) / 64;
  current.dir = V3(
    Math.sin(current.euler.y),
    0,
    Math.cos(current.euler.y)
  ).normalize();
  current.direction = vec3(front).multiply(current.dir).multiplyScalar(0.5);
}
