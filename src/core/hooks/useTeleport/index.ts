import { useCallback } from 'react';

import { Vector3, Euler } from 'three';

import { useStateSystem } from '../../motions/hooks/useStateSystem';

export interface TeleportResult {
  teleport: (position: Vector3, rotation?: Euler) => void;
  canTeleport: boolean;
}

export function useTeleport(): TeleportResult {
  const { activeState, updateActiveState } = useStateSystem();
  
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
  }, [activeState, updateActiveState]);

  return {
    teleport,
    canTeleport,
  };
}
