export default function rotation(props) {
    var outerGroupRef = props.outerGroupRef, euler = props.euler, quat = props.quat, delta = props.delta;
    quat.setFromEuler(euler);
    outerGroupRef.current.quaternion.rotateTowards(quat, delta);
}
