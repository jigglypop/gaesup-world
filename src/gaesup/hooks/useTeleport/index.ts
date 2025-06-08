import { useContext } from 'react';
import * as THREE from 'three';
import { GaesupContext } from '../../context';

export interface TeleportResult {
  teleport: (position: THREE.Vector3) => boolean;
  canTeleport: boolean;
}

export function useTeleport(): TeleportResult {
  const worldContext = useContext(GaesupContext);

  const canTeleport = Boolean(worldContext?.refs?.rigidBodyRef?.current);

  const teleport = (position: THREE.Vector3): boolean => {
    if (!worldContext?.refs?.rigidBodyRef?.current) {
      console.warn('Teleport failed: rigidBodyRef is not available');
      return false;
    }

    try {
      worldContext.refs.rigidBodyRef.current.setTranslation(position, true);
      return true;
    } catch (error) {
      console.error('Teleport failed:', error);
      return false;
    }
  };

  return {
    teleport,
    canTeleport,
  };
}
