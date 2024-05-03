import { quat, vec3 } from "@react-three/rapier";
export default function innerCalc(prop) {
    var rigidBodyRef = prop.rigidBodyRef, _a = prop.worldContext, activeState = _a.activeState, block = _a.block;
    activeState.position = vec3(rigidBodyRef.current.translation());
    activeState.velocity = vec3(rigidBodyRef.current.linvel());
    rigidBodyRef.current.setRotation(quat().setFromEuler(activeState.euler.clone()), false);
}
