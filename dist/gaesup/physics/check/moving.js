export default function moving(prop) {
    var _a = prop.worldContext, states = _a.states, joystick = _a.joystick, mode = _a.mode, control = _a.control;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward, shift = control.shift, space = control.space;
    if (mode.controller === "gameboy" || mode.controller === "keyboard") {
        states.isMoving = forward || backward || leftward || rightward;
        states.isNotMoving = !states.isMoving;
        states.isRunning = shift && states.isMoving;
        states.isJumping = space;
    }
    else if (mode.controller === "joystick") {
        states.isMoving = joystick.joyStickOrigin.isOn;
        states.isNotMoving = !joystick.joyStickOrigin.isOn;
        states.isRunning =
            joystick.joyStickOrigin.isOn && joystick.joyStickOrigin.isIn;
        states.isJumping = space;
    }
}
