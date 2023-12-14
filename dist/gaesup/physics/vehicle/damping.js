export default function damping(prop) {
    var rigidBodyRef = prop.rigidBodyRef, constant = prop.constant, control = prop.worldContext.control;
    var space = control.space;
    var brakeRate = constant.brakeRate;
    rigidBodyRef.current.setLinearDamping(space ? brakeRate : 0.5);
}
