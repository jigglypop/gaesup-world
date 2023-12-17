export default function damping(prop) {
    var rigidBodyRef = prop.rigidBodyRef, linearDamping = prop.controllerContext.character.linearDamping;
    rigidBodyRef.current.setLinearDamping(linearDamping);
}
