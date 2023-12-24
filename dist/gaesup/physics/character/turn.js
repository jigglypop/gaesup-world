export default function turn(prop) {
    var outerGroupRef = prop.outerGroupRef, innerGroupRef = prop.innerGroupRef, rigidBodyRef = prop.rigidBodyRef, delta = prop.delta, activeState = prop.worldContext.activeState, turnSpeed = prop.controllerContext.character.turnSpeed;
    activeState.quat.setFromEuler(activeState.euler);
    // outerGroupRef.current.quaternion.rotateTowards(
    //   activeState.quat,
    //   delta * turnSpeed
    // );
    innerGroupRef.current.quaternion.rotateTowards(activeState.quat, delta * turnSpeed);
}
