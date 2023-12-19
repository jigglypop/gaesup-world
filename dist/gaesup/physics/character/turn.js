export default function turn(prop) {
    var outerGroupRef = prop.outerGroupRef, delta = prop.delta, activeState = prop.worldContext.activeState, turnSpeed = prop.controllerContext.character.turnSpeed;
    activeState.quat.setFromEuler(activeState.euler);
    outerGroupRef.current.quaternion.rotateTowards(activeState.quat, delta * turnSpeed);
}
