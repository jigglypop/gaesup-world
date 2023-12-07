import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";
import { V3 } from "../../utils/vector";

export default function impulse(prop: calcPropType) {
  const { rigidBodyRef, slopeRay, move, control } = prop;
  const [current] = prop.current;
  const [states] = prop.states;
  const { forward, backward } = control;
  const { isMoving } = states;

  if (isMoving) {
    if (0.2 < Math.abs(slopeRay.angle) && Math.abs(slopeRay.angle) < 1) {
      current.direction.set(
        0,
        Math.sin(slopeRay.angle),
        Math.cos(slopeRay.angle)
      );
    } else {
      current.direction.set(0, 0, Number(forward) - Number(backward));
    }
    const M = rigidBodyRef.current.mass();
    const A = move.accelation;
    const F = A.multiplyScalar(M);
    current.impulse = V3(
      F.x,
      current.direction.y * (Math.abs(Math.sin(slopeRay.angle)) * 0.1),
      F.z
    );

    rigidBodyRef.current.applyImpulseAtPoint(
      current.impulse,
      vec3()
        .copy(current.position)
        .add(vec3().set(0, 0.5, 0)),
      false
    );
  }
}
