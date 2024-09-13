export default function moving(prop) {
    const { worldContext: { states, mode, control, clicker, clickerOption }, } = prop;
    const { shift, space } = control;
    if (mode.controller === "clicker") {
        states.isMoving = clicker.isOn;
        states.isNotMoving = !clicker.isOn;
        states.isRunning =
            (shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
        states.isJumping = space;
    }
}
