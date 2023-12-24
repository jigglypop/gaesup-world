export default function stabilizing(props) {
    var rigidBodyRef = props.rigidBodyRef;
    rigidBodyRef.current.setEnabledRotations(false, false, false, false);
}
