import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState, control, mode, joystick },
    controllerContext: { vehicle },
  } = prop;
  const { shift } = control;
  const { maxSpeed, accelRatio } = vehicle;
  const velocity = rigidBodyRef.current.linvel();
  const currentSpeed = Math.sqrt(
    velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
  );
  if (currentSpeed > maxSpeed) {
    return null;
  }

  let speed = 1;
  if (mode.controller === "joystick") {
    if (!joystick.joyStickOrigin.isCenter)
      speed = joystick.joyStickOrigin.isIn ? accelRatio : 1;
  } else {
    speed = shift ? accelRatio : 1;
  }

  rigidBodyRef.current.applyImpulse(
    vec3().addScalar(speed).multiply(activeState.dir.clone().normalize()),
    false
  );
}
