import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

/**
 * This function applies an impulse to a rigid body in the game world.
 *
 * @param {calcPropType} prop - An object containing properties necessary for applying the impulse.
 * @param {object} prop.rigidBodyRef - A reference to the rigid body to which the impulse is applied.
 * @param {object} prop.worldContext - An object representing the current state of the game world.
 * @param {object} prop.controllerContext - An object containing controller-specific context data.
 * @param {object} prop.controllerContext.vehicle - An object representing the vehicle controller context.
 * @param {number} prop.controllerContext.vehicle.maxSpeed - The maximum speed of the vehicle.
 *
 * This function calculates the current speed of the rigid body and compares it to the maximum speed.
 * If the current speed is greater than the maximum speed, no impulse is applied.
 * Otherwise, an impulse is applied to the rigid body in the direction specified by `activeState.dir.
 */
export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState, control, mode, joystick },
    controllerContext: { vehicle },
  } = prop;
  const { shift } = control;
  const { maxSpeed, accelRatio } = vehicle;

  const velocity = rigidBodyRef.current.linvel();
  // const V = vec3(velocity).length();
  // a = v / t (t = 1) (approximate calculation)
  const V = vec3(velocity).length();
  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    let speed = 1;
    if (mode.controller === "joystick") {
      if (!joystick.joyStickOrigin.isCenter)
        speed = joystick.joyStickOrigin.isIn ? accelRatio : 1;
    } else {
      speed = shift ? accelRatio : 1;
    }
    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      vec3()
        .addScalar(speed)
        .multiply(activeState.dir.clone().normalize())
        .multiplyScalar(M),
      false
    );
  }
}
