import { V3 } from "../../utils/vector";
export default function jump(prop) {
    var rigidBodyRef = prop.rigidBodyRef, slopeRay = prop.slopeRay, constant = prop.constant, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    var isOnTheGround = states.isOnTheGround, isJumping = states.isJumping;
    var jumpSpeed = constant.jumpSpeed;
    if (isJumping && isOnTheGround) {
        rigidBodyRef.current.setLinvel(V3(0, jumpSpeed * 0.25, 0)
            .projectOnVector(slopeRay.current)
            .add(activeState.velocity.setY(jumpSpeed)), false);
    }
}
