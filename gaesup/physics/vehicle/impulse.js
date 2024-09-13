import { vec3 } from "@react-three/rapier";
export default function impulse(prop) {
    const { rigidBodyRef, worldContext: { activeState, control }, controllerContext: { vehicle }, } = prop;
    const { shift } = control;
    const { maxSpeed, accelRatio } = vehicle;
    const velocity = rigidBodyRef.current.linvel();
    // a = v / t (t = 1) (approximate calculation)
    const V = vec3(velocity).length();
    if (V < maxSpeed) {
        const M = rigidBodyRef.current.mass();
        let speed = shift ? accelRatio : 1;
        // impulse = mass * velocity
        rigidBodyRef.current.applyImpulse(vec3()
            .addScalar(speed)
            .multiply(activeState.dir.clone().normalize())
            .multiplyScalar(M), false);
    }
}
