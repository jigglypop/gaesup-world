import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { vec3 } from '@react-three/rapier';

/**
 *
 * @param rigidBody
 * @param stabilize
 * @returns
 *
 */

export default function stabilizing(prop: propType) {
  const { rigidBodyRef, constant } = prop;
  useFrame(() => {
    if (!rigidBodyRef || !rigidBodyRef.current) return null;
    const { reconsil, rotational, vertical } = constant;
    const rotation = rigidBodyRef.current.rotation();
    const angvel = rigidBodyRef.current.angvel();
    rigidBodyRef.current.applyTorqueImpulse(
      vec3(rotation)
        .multiplyScalar(-reconsil)
        .add(
          vec3({
            x: -rotational,
            y: -vertical,
            z: -rotational
          }).multiply(vec3(angvel))
        ),
      false
    );
  });
}
