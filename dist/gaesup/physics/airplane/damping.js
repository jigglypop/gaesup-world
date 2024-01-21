export default function damping(prop) {
    var rigidBodyRef = prop.rigidBodyRef, airplane = prop.controllerContext.airplane;
    var linearDamping = airplane.linearDamping;
    rigidBodyRef.current.setLinearDamping(linearDamping);
}
