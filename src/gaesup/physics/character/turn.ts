import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function turn(prop: calcPropType) {
  const { outerGroupRef, constant, delta, move } = prop;
  const [current] = prop.current;
  const { turnSpeed } = constant;
  const [states] = prop.states;
  const { isRotated } = states;

  current.quat.setFromEuler(current.euler);
  outerGroupRef.current.quaternion.rotateTowards(
    current.quat,
    delta * turnSpeed
  );

  const turnVector = vec3({
    x: 1,
    y: 1,
    z: 1,
  }).multiplyScalar(isRotated ? 1 : 1 / turnSpeed);
  move.impulse.multiply(turnVector);
}
