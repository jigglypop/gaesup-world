import { V3 } from "../../utils/vector";
export default function jump(prop) {
    var rigidBodyRef = prop.rigidBodyRef, slopeRay = prop.slopeRay, _a = prop.worldContext, states = _a.states, activeState = _a.activeState, jumpSpeed = prop.controllerContext.character.jumpSpeed;
    var isOnTheGround = states.isOnTheGround, isJumping = states.isJumping;
    if (isJumping && isOnTheGround) {
        rigidBodyRef.current.setLinvel(V3(0, jumpSpeed * 0.25, 0)
            .projectOnVector(slopeRay.current)
            .add(activeState.velocity.setY(jumpSpeed)), true);
    }
}
