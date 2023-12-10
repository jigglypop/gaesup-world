import { vec3 } from "@react-three/rapier";
import { checkPropType } from ".";

export default function checkOnTheGround(prop: checkPropType) {
  const {
    capsuleColliderRef,
    groundRay,
    worldContext: { characterCollider: collider, states, activeState },
  } = prop;

  groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
  if (!groundRay.hit || !groundRay.rayCast || !capsuleColliderRef.current)
    return null;
  if (groundRay.hit.toi < collider.radius + 0.4) {
    states.isOnTheGround = true;
  } else {
    states.isOnTheGround = false;
  }
}
