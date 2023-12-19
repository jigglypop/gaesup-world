export default function gravity(prop) {
    var rigidBodyRef = prop.rigidBodyRef, groundRay = prop.groundRay, airplane = prop.controllerContext.airplane;
    var buoyancy = airplane.buoyancy;
    if (groundRay.hit) {
        rigidBodyRef.current.setGravityScale(1, false);
    }
    else {
        rigidBodyRef.current.setGravityScale(buoyancy, false);
    }
}
