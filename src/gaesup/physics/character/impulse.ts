import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    slopeRay,
    worldContext: { states, activeState },
  } = prop;
  const { isMoving } = states;

  if (isMoving) {
    const M = rigidBodyRef.current.mass();
    const A = activeState.acceleration;
    const F = A.multiplyScalar(M);

    activeState.impulse = V3(
      F.x,
      activeState.direction.normalize().y * Math.abs(Math.sin(slopeRay.angle)),
      F.z
    );
    rigidBodyRef.current.applyImpulse(activeState.impulse, false);
  }
}
