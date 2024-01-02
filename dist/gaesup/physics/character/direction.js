import { V3, calcAngleByVector } from "../../utils/vector";
export function orbitDirection(_a) {
    var activeState = _a.activeState, control = _a.control, mode = _a.mode, joystick = _a.joystick, state = _a.state;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward;
    var dirX = Number(leftward) - Number(rightward);
    var dirZ = Number(forward) - Number(backward);
    var start = 0;
    if (mode.controller === "joystick") {
        activeState.euler.y =
            -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
        start = 1;
    }
    else {
        if (dirX === 0 && dirZ === 0)
            return;
        activeState.euler.y += (dirX * Math.PI) / 32;
        start = dirZ;
    }
    var front = V3(start, 0, start);
    activeState.direction = front.multiply(V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)));
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
        // 일반 컨트롤
        // right hand rule. north -> east -> south -> west
        var dirX = Number(leftward) - Number(rightward);
        var dirZ = Number(forward) - Number(backward);
        if (dirX === 0 && dirZ === 0)
            return;
        var dir = V3(dirX, 0, dirZ);
        var angle = calcAngleByVector(dir);
        activeState.euler.y = angle;
        activeState.dir.set(dirX, 0, dirZ);
    }
}
export default function direction(prop) {
    var state = prop.state, _a = prop.worldContext, joystick = _a.joystick, mode = _a.mode, activeState = _a.activeState, control = _a.control;
    if (mode.control === "normal") {
        normalDirection({ activeState: activeState, control: control, mode: mode, joystick: joystick, state: state });
    }
    else if (mode.control === "orbit") {
        orbitDirection({ activeState: activeState, control: control, mode: mode, joystick: joystick, state: state });
    }
}
