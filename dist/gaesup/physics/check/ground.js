import { vec3 } from "@react-three/rapier";
export default function checkOnTheGround(prop) {
    var capsuleColliderRef = prop.capsuleColliderRef, groundRay = prop.groundRay, _a = prop.worldContext, collider = _a.characterCollider, states = _a.states, activeState = _a.activeState;
    groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
    if (!groundRay.hit || !groundRay.rayCast || !capsuleColliderRef.current) {
        states.isOnTheGround = false;
        return;
    }
    if (groundRay.hit.toi < collider.radius + 0.4) {
        states.isOnTheGround = true;
    }
    else {
        states.isOnTheGround = false;
    }
}
