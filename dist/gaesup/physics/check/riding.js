export default function riding(prop) {
    var _a = prop.worldContext, states = _a.states, rideable = _a.rideable, mode = _a.mode;
    var isRiding = states.isRiding;
    if (isRiding && states.isPush["keyR"]) {
        states.isLanding = true;
    }
}
