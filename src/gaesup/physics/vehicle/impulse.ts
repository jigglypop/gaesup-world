import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState, control },
    controllerContext: { vehicle },
    inputRef
  } = prop;
  
  // === 새로운 ref 기반 시스템 우선 사용 ===
  let shift: boolean;
  if (inputRef && inputRef.current) {
    shift = inputRef.current.keyboard.shift;
  } else {
    // === 기존 시스템 fallback (하위 호환성) ===
    shift = control.shift;
  }
  
  const { maxSpeed, accelRatio } = vehicle;

  const velocity = rigidBodyRef.current.linvel();
  // a = v / t (t = 1) (approximate calculation)
  const V = vec3(velocity).length();
  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    let speed = shift ? accelRatio : 1;
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
