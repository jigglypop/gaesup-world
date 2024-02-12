export default function push(prop) {
    var _a = prop.worldContext, states = _a.states, control = _a.control;
    Object.keys(control).forEach(function (key) {
        states.isPush[key] = control[key];
    });
}
