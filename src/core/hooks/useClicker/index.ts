import { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useGaesupStore } from '@stores/gaesupStore';
import { V3 } from '@utils/vector';
import { ClickerMoveOptions, ClickerResult } from './types';

export function useClicker(options: ClickerMoveOptions = {}): ClickerResult {
  const { minHeight = 0.5, offsetY = 0.5 } = options;
  const { activeState, block, setPointer } = useGaesupStore();
  const isReady = Boolean(activeState?.position);

  useFrame(() => {
    if (block.control || !activeState) return;
  });

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

      setPointer({
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
      setPointer({
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
