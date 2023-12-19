export default function stabilizing(prop) {
    var rigidBodyRef = prop.rigidBodyRef;
    rigidBodyRef.current.setEnabledRotations(false, false, false, false);
}
