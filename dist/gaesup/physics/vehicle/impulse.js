import { vec3 } from "@react-three/rapier";
export default function impulse(prop) {
    var rigidBodyRef = prop.rigidBodyRef, _a = prop.worldContext, activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick, vehicle = prop.controllerContext.vehicle;
    var shift = control.shift;
    var maxSpeed = vehicle.maxSpeed, accelRatio = vehicle.accelRatio;
    var velocity = rigidBodyRef.current.linvel();
    // a = v / t (t = 1) (approximate calculation)
    var V = vec3(velocity).length();
    if (V < maxSpeed) {
        var M = rigidBodyRef.current.mass();
        var speed = 1;
        if (mode.controller === "joystick") {
            if (!joystick.joyStickOrigin.isCenter)
                speed = joystick.joyStickOrigin.isIn ? accelRatio : 1;
        }
        else {
            speed = shift ? accelRatio : 1;
        }
        // impulse = mass * velocity
        rigidBodyRef.current.applyImpulse(vec3()
            .addScalar(speed)
            .multiply(activeState.dir.clone().normalize())
            .multiplyScalar(M), false);
    }
}
