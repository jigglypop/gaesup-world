export default function damping(prop) {
    const { rigidBodyRef, controllerContext: { airplane }, } = prop;
    const { linearDamping } = airplane;
    rigidBodyRef.current.setLinearDamping(linearDamping);
}
