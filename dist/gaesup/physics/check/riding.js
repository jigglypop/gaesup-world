export default function riding(prop) {
    var states = prop.worldContext.states;
    var isRiderOn = states.isRiderOn;
    if (isRiderOn && states.isPush["keyR"]) {
        states.isRiding = true;
    }
}
