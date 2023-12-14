export default function turn(prop) {
    var outerGroupRef = prop.outerGroupRef, constant = prop.constant, delta = prop.delta, activeState = prop.worldContext.activeState;
    var turnSpeed = constant.turnSpeed;
    activeState.quat.setFromEuler(activeState.euler);
    outerGroupRef.current.quaternion.rotateTowards(activeState.quat, delta * turnSpeed);
}
