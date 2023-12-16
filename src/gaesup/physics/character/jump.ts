import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function jump(prop: calcPropType) {
  const {
    rigidBodyRef,
    slopeRay,
    worldContext: { states, activeState },
    controllerContext: {
      character: { jumpSpeed },
    },
  } = prop;
  const { isOnTheGround, isJumping } = states;
  if (isJumping && isOnTheGround) {
    rigidBodyRef.current.setLinvel(
      V3(0, jumpSpeed * 0.25, 0)
        .projectOnVector(slopeRay.current)
        .add(activeState.velocity.setY(jumpSpeed)),
      false
    );
  }
}
