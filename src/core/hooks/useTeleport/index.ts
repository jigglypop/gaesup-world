import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';

export interface TeleportResult {
  teleport: (position: THREE.Vector3) => boolean;
  canTeleport: boolean;
}

export function useTeleport(): TeleportResult {
  const activeState = useGaesupStore((state) => state.activeState);
  const setActiveState = useGaesupStore((state) => state.setActiveState);
  const canTeleport = Boolean(activeState);

  const teleport = (position: THREE.Vector3): boolean => {
    if (!activeState) {
      return false;
    }

    try {
      setActiveState({
        ...activeState,
        position: position.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
      });

      const teleportEvent = new CustomEvent('gaesup:teleport', {
        detail: {
          position: position.clone(),
          timestamp: Date.now(),
        },
      });

      window.dispatchEvent(teleportEvent);
      document.dispatchEvent(
        new CustomEvent('teleport-request', {
          detail: { position: position.clone() },
        }),
      );
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
