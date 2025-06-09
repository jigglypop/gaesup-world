import { ThreeEvent } from '@react-three/fiber';
import { useSetAtom } from 'jotai';
import { useContext } from 'react';
import { pointerInputAtom } from '../../atoms/inputAtom';
import { GaesupContext } from '../../atoms';
import { V3 } from '../../utils';
import { ClickerMoveOptions, ClickerResult } from './types';

export function useClicker(options: ClickerMoveOptions = {}): ClickerResult {
  const { minHeight = 0.5, offsetY = 0.5 } = options;
  const { activeState } = useContext(GaesupContext);
  const setMouseInput = useSetAtom(pointerInputAtom);
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

      setMouseInput({
        target: finalTarget,
        angle: newAngle,
        isActive: true,
        shouldRun: isRun,
      });

      return true;
    } catch (error) {
      console.error('Clicker move failed:', error);
      return false;
    }
  };

  const stopClicker = () => {
    try {
      setMouseInput({
        isActive: false,
        shouldRun: false,
      });
    } catch (error) {
      console.error('Clicker stop failed:', error);
    }
  };

  return {
    moveClicker,
    stopClicker,
    isReady,
  };
}
