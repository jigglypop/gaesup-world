import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function jump(prop: calcPropType) {
  const {
    rigidBodyRef,
    slopeRay,
    constant,
    worldContext: { states, activeState },
  } = prop;
  const { isOnTheGround, isJumping } = states;
  const { jumpSpeed } = constant;
  if (isJumping && isOnTheGround) {
    rigidBodyRef.current.setLinvel(
      V3(0, jumpSpeed * 0.25, 0)
        .projectOnVector(slopeRay.current)
        .add(activeState.velocity.setY(jumpSpeed)),
      false
    );
  }
}
