import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    constant,
    worldContext: { activeState, control, mode, joystick },
    controllerContext: { vehicle },
  } = prop;
  const { shift } = control;
  const { accelRate } = constant;
  const { maxSpeed } = vehicle;
  const velocity = rigidBodyRef.current.linvel();
  const currentSpeed = Math.sqrt(
    velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
  );
  if (currentSpeed > maxSpeed) {
    return null;
  }

  let speed = 1;
  if (mode.controller === "joystick") {
    console.log(joystick.joyStickOrigin.isCenter);
    if (!joystick.joyStickOrigin.isCenter)
      speed = joystick.joyStickOrigin.isIn ? accelRate : 1;
  } else {
    speed = shift ? accelRate : 1;
  }

  rigidBodyRef.current.applyImpulse(
    vec3({
      x: activeState.direction.x,
      y: 0,
      z: activeState.direction.z,
    }).multiplyScalar(speed),
    false
  );
}
