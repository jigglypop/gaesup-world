export default function moving(prop) {
    var _a = prop.worldContext, states = _a.states, joystick = _a.joystick, mode = _a.mode, control = _a.control, clicker = _a.clicker, clickerOption = _a.clickerOption;
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
        states.isRunning = shift && states.isMoving;
        states.isJumping = space;
    }
    else if (mode.controller === "clicker") {
        states.isMoving = clicker.isOn;
        states.isNotMoving = !clicker.isOn;
        states.isRunning =
            (shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
        states.isJumping = space;
    }
}
