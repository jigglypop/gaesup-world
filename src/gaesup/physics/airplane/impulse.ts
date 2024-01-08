import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

/**
 * This function applies an impulse to a rigid body in the game world.
 *
 * @param {calcPropType} prop - An object containing properties necessary for applying the impulse.
 * @param {object} prop.rigidBodyRef - A reference to the rigid body to which the impulse is applied.
 * @param {object} prop.worldContext - An object representing the current state of the game world.
 * @param {object} prop.controllerContext - An object containing controller-specific context data.
 * @param {object} prop.controllerContext.airplane - An object representing the airplane controller context.
 * @param {number} prop.controllerContext.airplane.maxSpeed - The maximum speed of the airplane.
 *
 * This function calculates the current speed of the rigid body and compares it to the maximum speed.
 * If the current speed is greater than the maximum speed, no impulse is applied.
 * Otherwise, an impulse is applied to the rigid body in the direction specified by `activeState.direction`.
 */
export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    controllerContext: { airplane },
  } = prop;
  const { maxSpeed } = airplane;

  const velocity = rigidBodyRef.current.linvel();
  const currentSpeed = Math.sqrt(
    velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
  );
  if (currentSpeed > maxSpeed) {
    return null;
  }

  rigidBodyRef.current.applyImpulse(
    vec3({
      x: activeState.direction.x,
      y: activeState.direction.y,
      z: activeState.direction.z,
    }),
    false
  );
}
