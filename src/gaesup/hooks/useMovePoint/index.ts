import { vec3 } from '@react-three/rapier';
import { useSetAtom } from 'jotai';
import { useContext } from 'react';
import * as THREE from 'three';
import { pointerInputAtom } from '../../atoms/inputAtom';
import { GaesupContext } from '../../context';
import { V3 } from '../../utils';

export function useMovePoint() {
  const { activeState } = useContext(GaesupContext);
  const setMouseInput = useSetAtom(pointerInputAtom);

  const move = (position: THREE.Vector3, isRun: boolean) => {
    const u = activeState.position;
    const v = vec3(position);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);

    setMouseInput({
      target: V3(position.x, 0, position.z),
      angle: newAngle,
      isActive: true,
      shouldRun: isRun,
    });
  };

  return {
    move,
  };
}
