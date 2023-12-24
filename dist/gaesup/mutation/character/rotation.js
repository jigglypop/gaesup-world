export default function rotation(props) {
    var innerGroupRef = props.innerGroupRef, euler = props.euler, quaternion = props.quat, delta = props.delta;
    quaternion.setFromEuler(euler);
    innerGroupRef.current.quaternion.rotateTowards(quaternion, delta * 1);
}
