import { currentAtom } from '@gaesup/stores/current';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { vec3 } from '@react-three/rapier';
import { useAtom, useAtomValue } from 'jotai';

export default function checkOnMovingObject(prop: propType) {
  /**
   * Ray detect if on rigid body or dynamic platform, then apply the linear Vocity and angular Vocity to character
   */
  const states = useAtomValue(statesAtom);
  const [current, setCurrent] = useAtom(currentAtom);

  const subDirection = vec3();
  const { groundRay, move } = prop;
  const { dragDamping } = move;
  const { isNotMoving } = states;
  useFrame(() => {
    if (groundRay.hit && groundRay.parent) {
      current.standPosition.set(
        groundRay.origin.x,
        groundRay.origin.y - groundRay.hit.toi,
        groundRay.origin.z
      );
      const rayType = groundRay.parent.bodyType();
      const rayMass = groundRay.parent.mass();
      if ((rayType === 0 || rayType === 2) && rayMass > 0.5) {
        states.isOnMoving = true;
        subDirection
          .copy(current.position)
          .sub(vec3(groundRay.parent.translation()));
        const moveLinvel = vec3(groundRay.parent.linvel());
        const moveAngvel = vec3(groundRay.parent.angvel());
        const crossVector = vec3().crossVectors(moveAngvel, subDirection);
        move.velocity.set(
          moveLinvel.x + crossVector.x,
          moveLinvel.y,
          moveLinvel.z + crossVector.z
        );

        if (rayType === 0) {
          if (isNotMoving) {
            move.dragForce.set(
              (current.velocity.x - move.velocity.x) * dragDamping.x,
              0,
              (current.velocity.z - move.velocity.z) * dragDamping.z
            );
          } else {
            move.dragForce.copy(move.impulse).negate();
          }
          groundRay.parent.applyImpulseAtPoint(
            move.dragForce,
            current.standPosition,
            true
          );
        }
      } else {
        states.isOnMoving = false;
        move.velocity.set(0, 0, 0);
      }
    }
  });
}
