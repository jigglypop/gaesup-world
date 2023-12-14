export default function damping(prop) {
    var rigidBodyRef = prop.rigidBodyRef;
    rigidBodyRef.current.setLinearDamping(0.1);
}
