import { vec3 } from "@react-three/rapier";
export default function impulse(prop) {
    var rigidBodyRef = prop.rigidBodyRef, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    var isMoving = states.isMoving, isRunning = states.isRunning;
    var _b = prop.controllerContext.character, walkSpeed = _b.walkSpeed, runSpeed = _b.runSpeed, jumpSpeed = _b.jumpSpeed;
    var isOnTheGround = states.isOnTheGround, isJumping = states.isJumping;
    var impulse = vec3();
    if (isJumping && isOnTheGround) {
        impulse.setY(jumpSpeed * rigidBodyRef.current.mass());
    }
    if (isMoving) {
        var speed = isRunning ? runSpeed : walkSpeed;
        var velocity = vec3()
            .addScalar(speed)
            .multiply(activeState.dir.clone().normalize().negate());
        var M = rigidBodyRef.current.mass();
        // a = v / t = dv / 1 (dt = 1)
        var A = velocity.clone().sub(activeState.velocity);
        var F = A.multiplyScalar(M);
        impulse.setX(F.x);
        impulse.setZ(F.z);
    }
    rigidBodyRef.current.applyImpulse(impulse, true);
    activeState.position = vec3(rigidBodyRef.current.translation());
    activeState.velocity = vec3(rigidBodyRef.current.linvel());
}
