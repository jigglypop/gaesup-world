import { useContext } from 'react';
import * as THREE from 'three';
import { useGaesupContext } from '../../stores/gaesupStore';

export interface TeleportResult {
  teleport: (position: THREE.Vector3) => Promise<boolean>;
  canTeleport: boolean;
}

export function useTeleport(): TeleportResult {
  const { refs } = useGaesupContext();

  const canTeleport = Boolean(refs?.rigidBodyRef?.current);

  const teleport = async (position: THREE.Vector3): Promise<boolean> => {
    console.log('Teleport attempt - worldContext:', {
      hasContext: !!refs,
      hasRefs: !!refs,
      hasRigidBodyRef: !!refs?.rigidBodyRef,
      hasRigidBodyRefCurrent: !!refs?.rigidBodyRef?.current,
    });

    if (!refs) {
      console.warn('Teleport failed: worldContext not available');
      return false;
    }

    if (!refs) {
      console.warn('Teleport failed: refs not available in worldContext');
      return false;
    }

    if (!refs.rigidBodyRef) {
      console.warn('Teleport failed: rigidBodyRef not available in refs');
      return false;
    }

    // rigidBodyRef가 아직 초기화되지 않은 경우 잠시 대기
    let attempts = 0;
    const maxAttempts = 20; // 2초로 증가

    console.log('Waiting for rigidBodyRef to be initialized...');
    while (!refs.rigidBodyRef.current && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
      console.log(
        `Attempt ${attempts}/${maxAttempts} - rigidBodyRef.current:`,
        !!refs.rigidBodyRef.current,
      );
    }

    if (!refs.rigidBodyRef.current) {
      console.warn('Teleport failed: rigidBodyRef.current is not available after waiting');
      return false;
    }

    try {
      refs.rigidBodyRef.current.setTranslation(position, true);
      console.log('Teleport successful to:', position);
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
