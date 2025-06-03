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
  const groupRotationY = outerGroupRef.current.rotation.y;
  const activeRotationY = currentActiveState.euler.y;
  const isRotated = Math.sin(groupRotationY).toFixed(3) === Math.sin(activeRotationY).toFixed(3);

  // 회전 상태는 별도 처리 필요시 이벤트 추가 가능
  // 현재는 간단히 체크만 수행
}
