export default function damping(prop) {
    const { rigidBodyRef, worldContext: { control }, controllerContext: { vehicle }, } = prop;
    const { space } = control;
    const { brakeRatio, linearDamping } = vehicle;
    rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);
}
