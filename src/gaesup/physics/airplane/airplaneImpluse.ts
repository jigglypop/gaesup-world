import { colliderAtom } from '@gaesup/stores/collider';
import { currentAtom } from '@gaesup/stores/current';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { vec3 } from '@react-three/rapier';
import { useAtom, useAtomValue } from 'jotai';

export default function airplaneImpluse(prop: propType) {
  const { rigidBodyRef, slopeRay, groundRay, move, constant } = prop;
  const [current, setCurrent] = useAtom(currentAtom);

  const states = useAtomValue(statesAtom);
  const collider = useAtomValue(colliderAtom);
  const { isNotMoving, isOnMoving, isOnTheGround, isMoving, isRotated } =
    states;
  const { springConstant, turnSpeed } = constant;
  useFrame(() => {
    if (!rigidBodyRef || !rigidBodyRef.current) return null;
    rigidBodyRef.current.setGravityScale(0, false);
    const { dragDamping } = move;
    const reverse = current.velocity.multiply(dragDamping).negate();
    rigidBodyRef.current.applyImpulse(reverse, false);

    if (isMoving) {
      move.direction.set(0, 0, 1);
      const M = rigidBodyRef.current.mass();
      const A = move.accelation;
      const F = A.multiplyScalar(M * 10);

      const turnVector = vec3({
        x: 1,
        y: 1,
        z: 1
      }).multiplyScalar(isRotated ? 1 : 1 / turnSpeed);

      // 세팅
      move.impulse.copy(F).multiply(turnVector);

      rigidBodyRef.current.applyImpulseAtPoint(
        move.impulse,
        vec3().copy(current.position),
        false
      );
    }

    if (rigidBodyRef.current)
      setCurrent((current) => ({
        ...current,
        position: vec3(rigidBodyRef.current!.translation()),
        velocity: vec3(rigidBodyRef.current!.linvel())
      }));
  });
}
