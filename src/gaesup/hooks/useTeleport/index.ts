import { useContext } from 'react';
import * as THREE from 'three';
import { useGaesupContext } from '../../atoms';

export interface TeleportResult {
  teleport: (position: THREE.Vector3) => Promise<boolean>;
  canTeleport: boolean;
}

export function useTeleport(): TeleportResult {
  const worldContext = useGaesupContext();

  const canTeleport = Boolean(worldContext?.refs?.rigidBodyRef?.current);

  const teleport = async (position: THREE.Vector3): Promise<boolean> => {
    console.log('Teleport attempt - worldContext:', {
      hasContext: !!worldContext,
      hasRefs: !!worldContext?.refs,
      hasRigidBodyRef: !!worldContext?.refs?.rigidBodyRef,
      hasRigidBodyRefCurrent: !!worldContext?.refs?.rigidBodyRef?.current,
    });

    if (!worldContext) {
      console.warn('Teleport failed: worldContext not available');
      return false;
    }

    if (!worldContext.refs) {
      console.warn('Teleport failed: refs not available in worldContext');
      return false;
    }

    if (!worldContext.refs.rigidBodyRef) {
      console.warn('Teleport failed: rigidBodyRef not available in refs');
      return false;
    }

    // rigidBodyRef가 아직 초기화되지 않은 경우 잠시 대기
    let attempts = 0;
    const maxAttempts = 20; // 2초로 증가

    console.log('Waiting for rigidBodyRef to be initialized...');
    while (!worldContext.refs.rigidBodyRef.current && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
      console.log(
        `Attempt ${attempts}/${maxAttempts} - rigidBodyRef.current:`,
        !!worldContext.refs.rigidBodyRef.current,
      );
    }

    if (!worldContext.refs.rigidBodyRef.current) {
      console.warn('Teleport failed: rigidBodyRef.current is not available after waiting');
      return false;
    }

    try {
      worldContext.refs.rigidBodyRef.current.setTranslation(position, true);
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
