import { vec3 } from "@react-three/rapier";
export default function impulse(prop) {
    var rigidBodyRef = prop.rigidBodyRef, activeState = prop.worldContext.activeState, airplane = prop.controllerContext.airplane;
    var maxSpeed = airplane.maxSpeed;
    var velocity = rigidBodyRef.current.linvel();
    // a = v / t (t = 1) (approximate calculation)
    var V = vec3(velocity).length();
    if (V < maxSpeed) {
        var M = rigidBodyRef.current.mass();
        // impulse = mass * velocity
        rigidBodyRef.current.applyImpulse(vec3({
            x: activeState.direction.x,
            y: activeState.direction.y,
            z: activeState.direction.z,
        }).multiplyScalar(M), false);
    }
}
