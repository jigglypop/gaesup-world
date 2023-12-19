import { vec3 } from "@react-three/rapier";
export default function accelaration(prop) {
    var _a = prop.worldContext, states = _a.states, activeState = _a.activeState, _b = prop.controllerContext.character, walkSpeed = _b.walkSpeed, runSpeed = _b.runSpeed;
    var isMoving = states.isMoving, isRunning = states.isRunning;
    if (!isMoving)
        return null;
    var speed = isRunning ? runSpeed : walkSpeed;
    var velocity = vec3().addScalar(speed).multiply(activeState.dir);
    activeState.acceleration.copy(velocity).sub(activeState.velocity);
}
