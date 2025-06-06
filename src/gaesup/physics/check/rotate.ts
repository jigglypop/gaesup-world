import * as THREE from 'three';
import { calcType } from '../type';

export default function rotate(
  prop: calcType,
  currentActiveState: { euler: THREE.Euler; isMoving?: boolean },
) {
  const { outerGroupRef } = prop;
  if (!currentActiveState.isMoving || !outerGroupRef?.current) {
    return;
  }
}
