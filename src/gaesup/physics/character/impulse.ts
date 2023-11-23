import { colliderAtom } from '@gaesup/stores/collider';
import useCalcControl from '@gaesup/stores/control';
import { currentAtom } from '@gaesup/stores/current';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { isValidOrZero } from '@gaesup/utils/vector';
import { useFrame } from '@react-three/fiber';
import { vec3 } from '@react-three/rapier';
import { useAtom, useAtomValue } from 'jotai';

export default function impulse(prop: propType) {
  const { rigidBodyRef, slopeRay, groundRay, move, constant } = prop;
  const [current, setCurrent] = useAtom(currentAtom);
  const { forward, backward } = useCalcControl(prop);

  const states = useAtomValue(statesAtom);
  const collider = useAtomValue(colliderAtom);
  const { isNotMoving, isOnMoving, isOnTheGround, isMoving, isRotated } =
    states;
  const { springConstant, turnSpeed } = constant;
  useFrame(() => {
    if (!rigidBodyRef || !rigidBodyRef.current) return null;
    if (groundRay.hit !== null && groundRay.parent && isOnTheGround) {
      if (isOnTheGround) {
        const { dragDamping } = move;
        const forward = isValidOrZero(
          isOnMoving && isNotMoving,
          vec3({
            x: move.velocity.x,
            y: 0,
            z: move.velocity.z
          }).multiply(dragDamping)
        );
        const reverse = isValidOrZero(
          isNotMoving,
          vec3({
            x: current.velocity.x,
            y: 0,
            z: current.velocity.z
          })
            .multiply(dragDamping)
            .negate()
        );
        // calc up impulse (Y)
        const K = springConstant;
        const dY = collider.radius + 0.3 - groundRay.hit.toi;
        const sY = rigidBodyRef.current.linvel().y;
        const impulseY = K * dY - dragDamping.y * sY;
        const dragImpulse = forward.add(reverse).setY(impulseY);

        rigidBodyRef.current.applyImpulse(dragImpulse, false);
        move.mass.set(0, Math.min(-impulseY, 0), 0);
        groundRay.parent.applyImpulseAtPoint(
          move.mass,
          current.standPosition,
          true
        );
      }
    }

    if (isMoving) {
      if (0.2 < Math.abs(slopeRay.angle) && Math.abs(slopeRay.angle) < 1) {
        move.direction.set(
          0,
          Math.sin(slopeRay.angle),
          Math.cos(slopeRay.angle)
        );
      } else {
        move.direction.set(0, 0, Number(backward) - Number(forward));
      }
      const M = rigidBodyRef.current.mass();
      const A = move.accelation;
      const F = A.multiplyScalar(M);

      const turnVector = vec3({
        x: 1,
        y: 1,
        z: 1
      }).multiplyScalar(isRotated ? 1 : 1 / turnSpeed);

      // 세팅
      move.impulse
        .set(
          F.x,
          move.direction.y * (Math.abs(Math.sin(slopeRay.angle)) * 0.1),
          F.z
        )
        .multiply(turnVector);

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
        velocity: vec3(rigidBodyRef.current!.linvel())
      }));
  });
}
