import { currentAtom } from '@gaesup/stores/current';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';

export default function turn(prop: propType) {
  const current = useAtomValue(currentAtom);
  const { outerGroupRef, constant } = prop;
  const { turnSpeed } = constant;
  useFrame((_, delta) => {
    if (!outerGroupRef || !outerGroupRef.current) return null;
    current.quat.setFromEuler(current.euler);
    outerGroupRef.current.quaternion.rotateTowards(
      current.quat,
      delta * turnSpeed
    );
  });
}
