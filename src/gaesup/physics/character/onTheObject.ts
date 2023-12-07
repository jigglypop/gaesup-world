import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";
import { isValidOrZero } from "../../utils/vector";

export default function onTheObject(prop: calcPropType) {
  const { characterCollider: collider } = prop.context;
  const { rigidBodyRef, groundRay, move, constant } = prop;
  const [current] = prop.current;
  const [states] = prop.states;
  const { isNotMoving, isOnMoving, isOnTheGround } = states;
  const { springConstant } = constant;
  if (groundRay.hit !== null && groundRay.parent && isOnTheGround) {
    if (isOnTheGround) {
      const { dragDamping } = move;
      const forward = isValidOrZero(
        isOnMoving && isNotMoving,
        vec3({
          x: move.velocity.x,
          y: 0,
          z: move.velocity.z,
        }).multiply(dragDamping)
      );
      const reverse = isValidOrZero(
        isNotMoving,
        vec3({
          x: current.velocity.x,
          y: 0,
          z: current.velocity.z,
        })
          .multiply(dragDamping)
          .negate()
      );
      // calc up impulse (Y)
      const K = springConstant;
      const dY = collider.radius + 0.3 - groundRay.hit.toi;
      const sY = rigidBodyRef.current.linvel().y;
      const impulseY = K * dY - dragDamping.y * sY;
      const dragImpulse = forward.add(reverse).setY(impulseY);

      rigidBodyRef.current.applyImpulse(dragImpulse, false);
      move.mass.set(0, Math.min(-impulseY, 0), 0);
      // groundRay.parent.applyImpulseAtPoint(
      //   move.mass,
      //   current.standPosition,
      //   true
      // );
    }
  }
}
