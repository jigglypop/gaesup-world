import { colliderAtom } from '@gaesup/stores/collider';
import { currentAtom } from '@gaesup/stores/current';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { useRapier, vec3 } from '@react-three/rapier';
import { useAtomValue } from 'jotai';

/**
 * Ray casting detect if on ground
 * 캐릭터가 땅 위에 있는지 감지합니다
 * @param capsuleColliderRef
 */

export default function checkOnTheGround(prop: propType) {
  const { capsuleColliderRef, groundRay } = prop;
  const current = useAtomValue(currentAtom);
  const states = useAtomValue(statesAtom);
  const collider = useAtomValue(colliderAtom);
  const { world } = useRapier();
  useFrame(() => {
    groundRay.origin.addVectors(current.position, vec3(groundRay.offset));
    if (!groundRay.hit || !groundRay.rayCast || !capsuleColliderRef.current)
      return null;
    groundRay.hit = world.castRay(
      groundRay.rayCast,
      groundRay.length,
      true,
      undefined,
      undefined,
      capsuleColliderRef.current
    );
    if (groundRay.hit && groundRay.hit.toi < collider.radius + 0.4) {
      states.isOnTheGround = true;
    } else {
      states.isOnTheGround = false;
    }
  });
}
