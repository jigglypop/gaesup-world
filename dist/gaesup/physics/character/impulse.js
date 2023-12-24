import { V3 } from "../../utils/vector";
export default function impulse(prop) {
    var rigidBodyRef = prop.rigidBodyRef, slopeRay = prop.slopeRay, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    var isMoving = states.isMoving;
    if (isMoving) {
        var M = rigidBodyRef.current.mass();
        var A = activeState.acceleration;
        var F = A.multiplyScalar(M);
        activeState.impulse = V3(F.x, activeState.direction.normalize().y * Math.abs(Math.sin(slopeRay.angle)), F.z);
        rigidBodyRef.current.applyImpulse(activeState.impulse, true);
    }
}
