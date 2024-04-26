import { quat } from "@react-three/rapier";
export default function innerCalc(prop) {
    var rigidBodyRef = prop.rigidBodyRef, innerGroupRef = prop.innerGroupRef, linearDamping = prop.controllerContext.character.linearDamping, _a = prop.worldContext, activeState = _a.activeState, states = _a.states, block = _a.block, delta = prop.delta;
    if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
        rigidBodyRef.current.setLinearDamping(linearDamping);
    }
    else {
        rigidBodyRef.current.setLinearDamping(states.isNotMoving ? linearDamping * 5 : linearDamping);
    }
    rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    innerGroupRef.current.quaternion.rotateTowards(quat().setFromEuler(activeState.euler), 10 * delta);
}
