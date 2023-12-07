import { calcPropType } from "..";
import { V3 } from "../../utils/vector";

export default function jump(prop: calcPropType) {
  const { rigidBodyRef, slopeRay, move, constant } = prop;
  const [current] = prop.current;
  const [states] = prop.states;
  const { isOnTheGround, isJumping } = states;
  // const { isJumping } = states;
  const { jumpAccelY, jumpSpeed } = constant;
  if (isJumping && isOnTheGround) {
    rigidBodyRef.current.setLinvel(
      V3(0, jumpSpeed * 0.25, 0)
        .projectOnVector(slopeRay.current)
        .add(current.velocity.setY(jumpSpeed)),
      false
    );
    move.mass.y *= jumpAccelY;
  }
}
