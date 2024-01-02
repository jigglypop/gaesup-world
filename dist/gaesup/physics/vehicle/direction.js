import { quat, vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export function joyStickDirection(prop) {
    var state = prop.state, _a = prop.worldContext, activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick;
    if (joystick.joyStickOrigin.isCenter)
        return;
    var zAxis = joystick.joyStickOrigin.isOn ? 1 : 0;
    var front = vec3().set(zAxis, 0, zAxis);
    var _euler = activeState.euler.clone();
    var __euler = activeState.euler.clone();
    __euler.y =
        -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
    activeState.euler.setFromQuaternion(quat()
        .setFromEuler(_euler)
        .slerp(quat().setFromEuler(__euler), joystick.joyStickOrigin.isIn ? 0.01 : 0.1));
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}
export default function direction(prop) {
    var _a = prop.worldContext, activeState = _a.activeState, control = _a.control;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward;
    var xAxis = Number(leftward) - Number(rightward);
    var zAxis = Number(forward) - Number(backward);
    var front = vec3().set(zAxis, 0, zAxis);
    activeState.euler.y += xAxis * (Math.PI / 64);
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}
