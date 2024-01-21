import { vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export function joystick(prop) {
    var state = prop.state, _a = prop.worldContext, activeState = _a.activeState, joystick = _a.joystick;
    var zAxis = joystick.joyStickOrigin.isOn ? 1 : 0;
    var front = vec3().set(zAxis, 0, zAxis);
    if (joystick.joyStickOrigin.isCenter)
        return front;
    activeState.euler.y = Math.PI / 2 - joystick.joyStickOrigin.angle;
    return front;
}
export function normal(prop) {
    var _a = prop.worldContext, activeState = _a.activeState, control = _a.control;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward;
    var xAxis = Number(leftward) - Number(rightward);
    var zAxis = Number(forward) - Number(backward);
    var front = vec3().set(zAxis, 0, zAxis);
    activeState.euler.y += xAxis * (Math.PI / 64);
    return front;
}
export default function direction(prop) {
    var _a = prop.worldContext, mode = _a.mode, activeState = _a.activeState;
    var front = vec3();
    if (mode.controller === "joystick")
        front.copy(joystick(prop));
    else
        front.copy(normal(prop));
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}
