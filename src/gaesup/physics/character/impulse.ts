import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function impulse(prop: calcPropType) {
  const { rigidBodyRef, slopeRay, move, control } = prop;
  const [current, setCurrent] = prop.current;
  const [states] = prop.states;
  const { forward, backward } = control;
  const { isMoving } = states;

  if (isMoving) {
    if (0.2 < Math.abs(slopeRay.angle) && Math.abs(slopeRay.angle) < 1) {
      move.direction.set(0, Math.sin(slopeRay.angle), Math.cos(slopeRay.angle));
    } else {
      move.direction.set(0, 0, Number(backward) - Number(forward));
    }
    const M = rigidBodyRef.current.mass();
    const A = move.accelation;
    const F = A.multiplyScalar(M);

    // 세팅
    move.impulse.set(
      F.x,
      move.direction.y * (Math.abs(Math.sin(slopeRay.angle)) * 0.1),
      F.z
    );

    rigidBodyRef.current.applyImpulseAtPoint(
      move.impulse,
      vec3()
        .copy(current.position)
        .add(vec3().set(0, 0.5, 0)),
      false
    );
  }
  if (rigidBodyRef.current)
    setCurrent((current) => ({
      ...current,
      position: vec3(rigidBodyRef.current!.translation()),
      velocity: vec3(rigidBodyRef.current!.linvel()),
    }));
}
