import { vec3 } from "@react-three/rapier";
export default function checkOnTheGround(prop) {
    var colliderRef = prop.colliderRef, groundRay = prop.groundRay, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
    if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
        states.isOnTheGround = false;
    }
    if (groundRay.hit) {
        var MAX = groundRay.length * 2;
        var MIN = groundRay.length * 0.8;
        if (groundRay.hit.toi >= MAX) {
            states.isFalling = true;
            states.isOnTheGround = false;
        }
        else if (MIN <= groundRay.hit.toi && groundRay.hit.toi < MAX) {
            states.isFalling = true;
        }
        else if (groundRay.hit.toi < MIN) {
            states.isFalling = false;
            states.isOnTheGround = true;
        }
    }
}
