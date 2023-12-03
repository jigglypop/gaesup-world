import { calcPropType } from "..";

export default function jump(prop: calcPropType) {
  const { rigidBodyRef, slopeRay, groundRay, jump, move, constant } = prop;
  const [current] = prop.current;
  const [states] = prop.states;
  const { isOnTheGround } = states;
  const { isJumping } = states;

  const { jumpAccelY, jumpSpeed } = constant;
  if (isJumping && isOnTheGround) {
    jump.velocity.set(current.velocity.x, jumpSpeed, current.velocity.z);
    rigidBodyRef.current.setLinvel(
      jump.direction
        .set(0, jumpSpeed * 0.25, 0)
        .projectOnVector(slopeRay.current)
        .add(jump.velocity),
      false
    );
    move.mass.y *= jumpAccelY;
    groundRay.parent?.applyImpulseAtPoint(
      move.mass,
      current.standPosition,
      true
    );
  }
}
