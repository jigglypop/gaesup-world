import { vec3 } from "@react-three/rapier";
export default function accelaration(prop) {
    var _a = prop.constant, walkSpeed = _a.walkSpeed, runSpeed = _a.runSpeed, _b = prop.worldContext, states = _b.states, activeState = _b.activeState;
    var isMoving = states.isMoving, isRunning = states.isRunning;
    if (!isMoving)
        return null;
    var speed = isRunning ? runSpeed : walkSpeed;
    var velocity = vec3().addScalar(speed).multiply(activeState.dir);
    activeState.acceleration.copy(velocity).sub(activeState.velocity);
}
