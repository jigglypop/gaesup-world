import { useCallback } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { Vector3, Euler } from 'three';
import { useStateEngine } from '../../motions/hooks/useStateEngine';

export interface TeleportResult {
  teleport: (position: Vector3, rotation?: Euler) => void;
  canTeleport: boolean;
}

export function useTeleport(): TeleportResult {
  const { activeState, updateActiveState } = useStateEngine();
  const setState = useGaesupStore((state) => state.updateState);
  
  const canTeleport = Boolean(activeState);

  const teleport = useCallback((position: Vector3, rotation?: Euler) => {
    if (!activeState) {
      console.warn('[useTeleport]: Cannot teleport - activeState not available');
      return;
    }
    
    updateActiveState({
      position: position.clone(),
      euler: rotation || activeState.euler,
    });
    
    setState({
      control: {
        isLocked: false,
        isMoving: false,
      },
    });
  }, [activeState, updateActiveState, setState]);

  return {
    teleport,
    canTeleport,
  };
}
