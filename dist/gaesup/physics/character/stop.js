export default function stop(prop) {
    var _a = prop.worldContext, control = _a.control, clicker = _a.clicker, mode = _a.mode;
    var keyS = control.keyS;
    if (keyS && mode.controller === "clicker") {
        clicker.isOn = false;
        clicker.isRun = false;
    }
}
