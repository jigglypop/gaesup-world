import { V3 } from "../../utils/vector";
export function joystickDirection() { }
export function orbitDirection(_a) {
    var activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick, state = _a.state;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward;
    var start = 0;
    if (mode.controller === "joystick") {
        if (!joystick.joyStickOrigin.isCenter)
            activeState.euler.y =
                -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
        start = joystick.joyStickOrigin.isOn ? 1 : 0;
    }
    else {
        activeState.euler.y +=
            ((Number(leftward) - Number(rightward)) * Math.PI) / 32;
        start = Number(forward) - Number(backward);
    }
    var front = V3(start, 0, start);
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}
export function normalDirection(_a) {
    var activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick, state = _a.state;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward;
    var start = 0;
    if (mode.controller === "joystick") {
        if (!joystick.joyStickOrigin.isCenter)
            activeState.euler.y =
                -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
        start = joystick.joyStickOrigin.isOn ? 1 : 0;
    }
    else {
        var angle = -state.camera.rotation.y;
        if (forward) {
            activeState.euler.y =
                angle +
                    Math.PI +
                    (leftward ? Math.PI / 4 : 0) -
                    (rightward ? Math.PI / 4 : 0);
        }
        else if (backward) {
            activeState.euler.y =
                angle - ((leftward ? Math.PI / 4 : 0) - (rightward ? Math.PI / 4 : 0));
        }
        else if (leftward) {
            activeState.euler.y = angle - Math.PI / 2;
        }
        else if (rightward) {
            activeState.euler.y = angle + Math.PI / 2;
        }
    }
    var front = V3(Number(rightward) - Number(leftward), 0, Number(backward) - Number(forward));
    activeState.direction = front;
    activeState.dir = activeState.direction.normalize();
}
export default function direction(prop) {
    var state = prop.state, _a = prop.worldContext, joystick = _a.joystick, mode = _a.mode, activeState = _a.activeState, control = _a.control, cameraMode = prop.controllerContext.cameraMode;
    if (cameraMode.controlType === "normal") {
        normalDirection({ activeState: activeState, control: control, mode: mode, joystick: joystick, state: state });
    }
    else if (cameraMode.controlType === "orbit") {
        orbitDirection({ activeState: activeState, control: control, mode: mode, joystick: joystick, state: state });
    }
}
