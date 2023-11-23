import { currentAtom } from '@gaesup/stores/current';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { vec3 } from '@react-three/rapier';
import { useAtomValue } from 'jotai';

export default function accelaration(prop: propType) {
  const states = useAtomValue(statesAtom);
  const { outerGroupRef, move, constant } = prop;
  const { isMoving, isRunning } = states;
  const current = useAtomValue(currentAtom);

  useFrame(() => {
    if (!outerGroupRef || !outerGroupRef.current || !isMoving) return null;
    const { direction, velocity: movingV } = move;
    const { velocity: currentV, reverseVelocity: reverseV } = current;

    direction.applyQuaternion(outerGroupRef.current.quaternion);
    // projection of velocity on direction
    const projectedV = movingV
      .clone()
      .projectOnVector(direction)
      .multiply(direction);
    const angle = movingV.angleTo(direction);
    const runRatio = constant.splintSpeed * (isRunning ? constant.runRate : 1);
    const reverseRatio = isMoving ? 0 : constant.rejectSpeed;
    // 1. movingV
    const runV = projectedV.addScalar(runRatio).multiply(direction);
    // 2. -current
    // 3. +reverse
    const moveAngleV = movingV.multiplyScalar(Math.sin(angle));
    // 4. -reverse
    const rejectV = reverseV.multiplyScalar(reverseRatio);
    // 5 / dT
    const DT = vec3().set(1 / constant.dT, 0, 1 / constant.dT);
    move.accelation
      .copy(runV)
      .sub(currentV)
      .add(moveAngleV)
      .sub(rejectV)
      .multiply(DT);
  });
}
