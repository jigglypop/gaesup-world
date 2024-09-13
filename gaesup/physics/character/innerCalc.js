import { quat } from "@react-three/rapier";
export default function innerCalc(prop) {
    const { rigidBodyRef, innerGroupRef, controllerContext: { character: { linearDamping }, }, worldContext: { activeState, states, block }, delta, } = prop;
    if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
        rigidBodyRef.current.setLinearDamping(linearDamping);
    }
    else {
        rigidBodyRef.current.setLinearDamping(states.isNotMoving ? linearDamping * 5 : linearDamping);
    }
    rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    innerGroupRef.current.quaternion.rotateTowards(quat().setFromEuler(activeState.euler), 10 * delta);
}
