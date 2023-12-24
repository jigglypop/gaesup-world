import { vec3 } from "@react-three/rapier";
export default function impulse(prop) {
    var rigidBodyRef = prop.rigidBodyRef, _a = prop.worldContext, activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick, vehicle = prop.controllerContext.vehicle;
    var shift = control.shift;
    var maxSpeed = vehicle.maxSpeed, accelRatio = vehicle.accelRatio;
    var velocity = rigidBodyRef.current.linvel();
    var currentSpeed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));
    if (currentSpeed > maxSpeed) {
        return null;
    }
    var speed = 1;
    if (mode.controller === "joystick") {
        if (!joystick.joyStickOrigin.isCenter)
            speed = joystick.joyStickOrigin.isIn ? accelRatio : 1;
    }
    else {
        speed = shift ? accelRatio : 1;
    }
    rigidBodyRef.current.applyImpulse(vec3({
        x: activeState.direction.x,
        y: 0,
        z: activeState.direction.z,
    }).multiplyScalar(speed), false);
}
