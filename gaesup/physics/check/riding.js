export default function riding(prop) {
    const { worldContext: { states }, } = prop;
    const { isRiderOn } = states;
    if (isRiderOn && states.isPush["keyR"]) {
        states.isRiding = true;
    }
}
