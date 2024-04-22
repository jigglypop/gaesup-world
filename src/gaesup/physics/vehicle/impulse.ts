import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState, control, mode, joystick },
    controllerContext: { vehicle },
  } = prop;
  const { shift } = control;
  const { maxSpeed, accelRatio } = vehicle;

  const velocity = rigidBodyRef.current.linvel();
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
