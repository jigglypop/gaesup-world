export default function gravity(prop) {
    var rigidBodyRef = prop.rigidBodyRef, groundRay = prop.groundRay, buoyancy = prop.controllerContext.airplane.buoyancy, airplaneCollider = prop.worldContext.airplaneCollider;
    if (groundRay.hit) {
        airplaneCollider.gravity =
            (1 - buoyancy) / (groundRay.length - groundRay.hit.toi);
        rigidBodyRef.current.setGravityScale(airplaneCollider.gravity, false);
    }
    else {
        airplaneCollider.gravity = buoyancy;
        rigidBodyRef.current.setGravityScale(airplaneCollider.gravity, false);
    }
}
