import { vec3 } from "@react-three/rapier";
export default function checkOnTheGround(prop) {
    var colliderRef = prop.colliderRef, groundRay = prop.groundRay, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
    if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
        states.isOnTheGround = false;
    }
    if (groundRay.hit) {
        if (groundRay.hit.toi >= groundRay.length * 0.8) {
            states.isFalling = true;
            states.isLanding = false;
            states.isOnTheGround = false;
        }
        else if (groundRay.length * 0.4 < groundRay.hit.toi &&
            groundRay.hit.toi < groundRay.length * 0.8) {
            states.isLanding = true;
            states.isFalling = false;
            states.isOnTheGround = false;
        }
        else {
            states.isFalling = false;
            states.isLanding = false;
            states.isOnTheGround = true;
        }
    }
}
