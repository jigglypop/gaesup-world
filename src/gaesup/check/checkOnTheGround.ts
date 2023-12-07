import { vec3 } from "@react-three/rapier";
import { checkPropType } from ".";

export default function checkOnTheGround(prop: checkPropType) {
  const { capsuleColliderRef, groundRay, world, context } = prop;
  const { characterCollider: collider } = context;
  const [current] = prop.current;
  const [states] = prop.states;

  groundRay.origin.addVectors(current.position, vec3(groundRay.offset));
  if (!groundRay.hit || !groundRay.rayCast || !capsuleColliderRef.current)
    return null;
  groundRay.hit = world.castRay(
    groundRay.rayCast,
    groundRay.length,
    true,
    undefined,
    undefined,
    capsuleColliderRef.current
  );
  if (groundRay.hit && groundRay.hit.toi < collider.radius + 0.4) {
    states.isOnTheGround = true;
  } else {
    states.isOnTheGround = false;
  }
}
