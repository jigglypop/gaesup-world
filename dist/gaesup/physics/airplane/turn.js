export default function turn(prop) {
    var rigidBodyRef = prop.rigidBodyRef, activeState = prop.worldContext.activeState;
    activeState.quat.setFromEuler(activeState.euler);
    rigidBodyRef.current.setRotation(activeState.quat, true);
}
