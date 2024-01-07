export default function push(prop) {
    var _a = prop.worldContext, states = _a.states, joystick = _a.joystick, mode = _a.mode, control = _a.control;
    Object.keys(control).forEach(function (key) {
        states.isPush[key] = control[key];
    });
}
