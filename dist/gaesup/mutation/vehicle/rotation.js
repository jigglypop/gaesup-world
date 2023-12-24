export default function rotation(props) {
    var rigidBodyRef = props.rigidBodyRef, euler = props.euler, quat = props.quat;
    quat.setFromEuler(euler);
    rigidBodyRef.current.setRotation(quat, false);
}
