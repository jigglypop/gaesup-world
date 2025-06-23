import { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useGaesupStore } from '@stores/gaesupStore';
import { V3 } from '@utils/vector';
import * as THREE from 'three';
import { ClickerMoveOptions, ClickerResult } from './types';

export function useClicker(options: ClickerMoveOptions = {}): ClickerResult {
  const { minHeight = 0.5, offsetY = 0.5 } = options;
  const { activeState } = useGaesupStore();
  const updateMouse = useGaesupStore((state) => state.updateMouse);
  const isReady = Boolean(activeState?.position);
  const moveClicker = (
    event: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: 'normal' | 'ground',
  ): boolean => {
    if (type !== 'ground') {
      console.warn('Clicker: Only ground type is supported');
      return false;
    }
    if (!activeState?.position) {
      console.warn('Clicker: Active state position is not available');
      return false;
    }
    try {
      const currentPosition = activeState.position;
      const targetPoint = V3(event.point.x, event.point.y, event.point.z);
      const newAngle = Math.atan2(
        targetPoint.z - currentPosition.z,
        targetPoint.x - currentPosition.x,
      );
      const adjustedY = Math.max(targetPoint.y + offsetY, minHeight);
      const finalTarget = V3(targetPoint.x, adjustedY, targetPoint.z);

      updateMouse({
        target: finalTarget,
        angle: newAngle,
        position: new THREE.Vector2(finalTarget.x, finalTarget.z),
        isActive: true,
        shouldRun: isRun,
      });

      return true;
    } catch (error) {
      console.error('Clicker move failed:', error);
      return false;
    }
  };

  const stopClicker = (): void => {
    try {
      if (!isReady) return;
      updateMouse({ isActive: false, shouldRun: false });
    } catch (error) {
      console.error('Clicker stop failed:', error);
    }
  };

  const onClick = (event: ThreeEvent<MouseEvent>): void => {
    console.log('onClick called:', { 
      point: event.point, 
      isReady,
      activeState: activeState?.position 
    });
    const result = moveClicker(event, false, 'ground');
    console.log('moveClicker result:', result);
  };

  return {
    moveClicker,
    stopClicker,
    onClick,
    isReady,
  };
}
