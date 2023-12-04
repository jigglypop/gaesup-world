import { V3, V31 } from "@gaesup/utils/vector";
import { calcPropType } from "..";

export default function direction(prop: calcPropType) {
  const [current] = prop.current;
  const { forward, backward, leftward, rightward } = prop.control;
  current.euler.y += ((Number(leftward) - Number(rightward)) * Math.PI) / 64;
  current.euler.x += ((Number(backward) - Number(forward)) * Math.PI) / 64;
  current.dir = V3(
    Math.cos(current.euler.z) * Math.cos(current.euler.y),
    Math.cos(current.euler.y),
    Math.sin(current.euler.y)
  ).normalize();
  current.direction = V31().multiply(current.dir).multiplyScalar(0.5);
}
