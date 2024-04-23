export default function damping(prop) {
    var rigidBodyRef = prop.rigidBodyRef, control = prop.worldContext.control, vehicle = prop.controllerContext.vehicle;
    var space = control.space;
    var brakeRatio = vehicle.brakeRatio, linearDamping = vehicle.linearDamping;
    rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);
}
