import { quat } from "@react-three/rapier";
export default function rotation(props) {
    var rigidBodyRef = props.rigidBodyRef, euler = props.euler, quaternion = props.quat, rotation = props.rotation, innerGroupRef = props.innerGroupRef;
    quaternion.setFromEuler(euler);
    rigidBodyRef.current.setRotation(quaternion, true);
    innerGroupRef.current.setRotationFromQuaternion(quat()
        .setFromEuler(innerGroupRef.current.rotation.clone())
        .slerp(quat().setFromEuler(rotation), 0.1));
}
