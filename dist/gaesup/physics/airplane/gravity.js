export default function gravity(prop) {
    var rigidBodyRef = prop.rigidBodyRef, groundRay = prop.groundRay;
    if (groundRay.hit) {
        rigidBodyRef.current.setGravityScale(1, false);
    }
    else {
        rigidBodyRef.current.setGravityScale(0.2, false);
    }
}
