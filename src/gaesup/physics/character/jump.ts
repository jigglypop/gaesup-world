import { V3 } from "@/gaesup/utils/vector";
import { calcPropType } from "..";

export default function jump(prop: calcPropType) {
  const { rigidBodyRef, slopeRay, groundRay, move, constant } = prop;
  const [current] = prop.current;
  const [states] = prop.states;
  const { isOnTheGround } = states;
  const { isJumping } = states;
  const { jumpAccelY, jumpSpeed } = constant;
  if (isJumping && isOnTheGround) {
    rigidBodyRef.current.setLinvel(
      V3(0, jumpSpeed * 0.25, 0)
        .projectOnVector(slopeRay.current)
        .add(current.velocity.setY(jumpSpeed)),
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
