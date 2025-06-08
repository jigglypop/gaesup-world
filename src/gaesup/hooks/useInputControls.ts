import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStore } from '../store/gameStore';
import { gameActions } from '../store/actions';
import { V3 } from '../utils';

export function usePushKey() {
  const pushKey = (key: string, value: boolean) => {
    gameActions.updateKeyboard({
      [key]: value,
    });
  };
  return {
    pushKey,
  };
}

export function useClicker() {
  const moveClicker = (e: ThreeEvent<MouseEvent>, isRun: boolean, type: 'normal' | 'ground') => {
    if (type !== 'ground') return;
    const u = gameStore.physics.activeState.position;
    const v = V3(e.point.x, e.point.y, e.point.z);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    const targetY = Math.max(v.y + 0.5, 0.5);
    const targetPoint = V3(v.x, targetY, v.z);
    gameActions.updatePointer({
      target: targetPoint,
      angle: newAngle,
      isActive: true,
      shouldRun: isRun,
    });
  };
  const stopClicker = () => {
    gameActions.updatePointer({
      isActive: false,
      shouldRun: false,
    });
  };
  return {
    moveClicker,
    stopClicker,
  };
}

export function useTeleport() {
  const Teleport = (position: THREE.Vector3) => {
    const rigidBodyRef = gameStore.physics.refs.rigidBodyRef;
    if (rigidBodyRef) {
      rigidBodyRef.setTranslation(position, true);
    }
  };
  return {
    Teleport,
  };
}
