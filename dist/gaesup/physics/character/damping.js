export default function damping(prop) {
    var rigidBodyRef = prop.rigidBodyRef, constant = prop.constant;
    rigidBodyRef.current.setLinearDamping(constant.linearDamping);
}
