import { vec3 } from "@react-three/rapier";
export default function checkOnTheGround(prop) {
    var colliderRef = prop.colliderRef, groundRay = prop.groundRay, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
    if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
        states.isOnTheGround = false;
        // return;
    }
    if (groundRay.hit) {
        if (groundRay.hit.toi < groundRay.length + 0.5) {
            states.isOnTheGround = true;
        }
        else {
            states.isOnTheGround = false;
        }
    }
}
