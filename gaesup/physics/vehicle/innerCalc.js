import { quat, vec3 } from "@react-three/rapier";
export default function innerCalc(prop) {
    const { rigidBodyRef, worldContext: { activeState }, } = prop;
    activeState.position = vec3(rigidBodyRef.current.translation());
    activeState.velocity = vec3(rigidBodyRef.current.linvel());
    rigidBodyRef.current.setRotation(quat().setFromEuler(activeState.euler.clone()), false);
}
