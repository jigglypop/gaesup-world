import { quat, vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export default function direction(prop) {
    var state = prop.state, _a = prop.worldContext, activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward;
    var start = Number(forward) - Number(backward);
    if (mode.controller === "joystick") {
        if (!joystick.joyStickOrigin.isCenter)
            start = joystick.joyStickOrigin.isOn ? 1 : 0;
    }
    else {
        start = Number(forward) - Number(backward);
    }
    var front = vec3().set(start, 0, start);
    var _euler = activeState.euler.clone();
    var __euler = activeState.euler.clone();
    if (mode.controller === "joystick") {
        if (!joystick.joyStickOrigin.isCenter)
            __euler.y =
                -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
    }
    else {
        activeState.euler.y +=
            ((Number(leftward) - Number(rightward)) * Math.PI) / 64;
    }
    if (mode.controller === "joystick")
        activeState.euler.setFromQuaternion(quat()
            .setFromEuler(_euler)
            .slerp(quat().setFromEuler(__euler), joystick.joyStickOrigin.isIn ? 0.01 : 0.1));
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}
