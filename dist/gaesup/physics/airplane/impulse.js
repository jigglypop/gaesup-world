import { vec3 } from "@react-three/rapier";
export default function impulse(prop) {
    var rigidBodyRef = prop.rigidBodyRef, _a = prop.worldContext, activeState = _a.activeState, control = _a.control, airplane = prop.controllerContext.airplane;
    var maxSpeed = airplane.maxSpeed;
    var velocity = rigidBodyRef.current.linvel();
    var currentSpeed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));
    if (currentSpeed > maxSpeed) {
        return null;
    }
    rigidBodyRef.current.applyImpulse(vec3({
        x: activeState.direction.x,
        y: activeState.direction.y,
        z: activeState.direction.z,
    }), false);
}
