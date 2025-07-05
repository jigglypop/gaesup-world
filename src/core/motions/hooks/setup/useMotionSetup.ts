import { useRef, useEffect, RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { MotionBridge } from '../../bridge/MotionBridge';
import { MotionCommand } from '../../bridge/types';
import { ModeType } from '@stores/slices';

let globalMotionBridge: MotionBridge | null = null;
function getGlobalMotionBridge(): MotionBridge {
  if (!globalMotionBridge) {
    globalMotionBridge = new MotionBridge();
  }
  return globalMotionBridge;
}

function useMotionSetup(
  entityId: string,
  rigidBodyRef: RefObject<RapierRigidBody>,
  modeType: ModeType,
  isActive: boolean
) {
  const registeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (isActive && rigidBodyRef.current && !registeredRef.current) {
      const motionBridge = getGlobalMotionBridge();
      motionBridge.register(
        entityId,
        modeType === 'vehicle' || modeType === 'airplane'
          ? 'vehicle'
          : 'character',
        rigidBodyRef.current
      );
      registeredRef.current = true;
      return () => {
        motionBridge.unregister(entityId);
        registeredRef.current = false;
      };
    }
  }, [isActive, rigidBodyRef, modeType, entityId]);

  const executeMotionCommand = (command: MotionCommand) => {
    if (registeredRef.current && isActive) {
      const motionBridge = getGlobalMotionBridge();
      motionBridge.execute(entityId, command);
    }
  };

  const updateMotion = (deltaTime: number) => {
    if (registeredRef.current && isActive) {
      const motionBridge = getGlobalMotionBridge();
      motionBridge.updateEntity(entityId, deltaTime);
    }
  };

  const getMotionSnapshot = () => {
    if (registeredRef.current && isActive) {
      const motionBridge = getGlobalMotionBridge();
      return motionBridge.snapshot(entityId);
    }
    return null;
  };

  return { executeMotionCommand, updateMotion, getMotionSnapshot };
}

export { useMotionSetup, getGlobalMotionBridge }; 