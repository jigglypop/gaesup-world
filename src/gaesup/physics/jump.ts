import { currentAtom } from '@gaesup/stores/current';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';

export default function jump(prop: propType) {
  const states = useAtomValue(statesAtom);
  const { rigidBodyRef, slopeRay, groundRay, jump, move, constant } = prop;
  const { isOnTheGround } = states;
  const current = useAtomValue(currentAtom);
  const { isJumping } = states;

  useFrame(() => {
    // Jump impulse
    const { jumpAccelY, jumpSpeed } = constant;
    if (isJumping && isOnTheGround && rigidBodyRef.current) {
      jump.velocity.set(current.velocity.x, jumpSpeed, current.velocity.z);
      // Apply slope normal to jump direction
      rigidBodyRef.current.setLinvel(
        jump.direction
          .set(0, jumpSpeed * 0.25, 0)
          .projectOnVector(slopeRay.current)
          .add(jump.velocity),
        false
      );
      // Apply jump force downward to the standing platform
      move.mass.y *= jumpAccelY;

      groundRay.parent?.applyImpulseAtPoint(
        move.mass,
        current.standPosition,
        true
      );
    }
  });
}
