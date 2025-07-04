import { ThreeEvent } from '@react-three/fiber';
import { V3 } from '@utils/vector';
import * as THREE from 'three';
import { ClickerMoveOptions, ClickerResult } from './types';
import { useStateEngine } from '../../motions/hooks/useStateEngine';
import { InteractionBridge } from '../../interactions/bridge/InteractionBridge';

let globalBridge: InteractionBridge | null = null;

function getGlobalBridge(): InteractionBridge {
  if (!globalBridge) {
    globalBridge = new InteractionBridge();
  }
  return globalBridge;
}

export function useClicker(options: ClickerMoveOptions = {}): ClickerResult {
  const { minHeight = 0.5, offsetY = 0.5 } = options;
  const { activeState } = useStateEngine();
  const bridge = getGlobalBridge();
  const isReady = Boolean(activeState?.position);
  
  const moveClicker = (
    event: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: 'normal' | 'ground',
  ): boolean => {
    console.log('moveClicker called:', { type, isRun, point: event.point });
    
    if (type !== 'ground') {
      return false;
    }
    if (!activeState?.position) {
      console.log('No active state position');
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

      console.log('Dispatching mouse input:', {
        target: finalTarget,
        angle: newAngle,
        isActive: true,
        shouldRun: isRun,
      });

      bridge.executeCommand({
        type: 'input',
        action: 'updateMouse',
        data: {
          target: finalTarget,
          angle: newAngle,
          position: new THREE.Vector2(finalTarget.x, finalTarget.z),
          isActive: true,
          shouldRun: isRun,
        }
      });

      return true;
    } catch (error) {
      console.error('moveClicker error:', error);
      return false;
    }
  };

  const stopClicker = (): void => {
    try {
      if (!isReady) return;
      bridge.executeCommand({
        type: 'input',
        action: 'updateMouse',
        data: { isActive: false, shouldRun: false }
      });
    } catch (error) {
    }
  };

  const onClick = (event: ThreeEvent<MouseEvent>): void => {
    moveClicker(event, false, 'ground');
  };

  return {
    moveClicker,
    stopClicker,
    onClick,
    isReady,
  };
}
