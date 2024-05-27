export default function gravity(prop) {
    var rigidBodyRef = prop.rigidBodyRef, activeState = prop.worldContext.activeState;
    rigidBodyRef.current.setGravityScale(activeState.position.y < 10
        ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1
        : 0.1, false);
}
