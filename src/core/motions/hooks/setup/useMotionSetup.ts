import { useRef, useEffect, RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { MotionBridge } from '../../bridge/MotionBridge';
import { MotionCommand } from '../../bridge/types';
import { ModeType } from '@stores/slices';

export function useMotionSetup(
  entityId: string,
  rigidBodyRef: RefObject<RapierRigidBody>,
  modeType: ModeType,
  isActive: boolean
) {
  const registeredRef = useRef<boolean>(false);
  const motionBridge = new MotionBridge();
  useEffect(() => {
    if (rigidBodyRef.current && !registeredRef.current) {
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
  }, [rigidBodyRef, modeType, entityId]);
  const executeMotionCommand = (command: MotionCommand) => {
    if (registeredRef.current && isActive) {
      motionBridge.execute(entityId, command);
    }
  };
  const getMotionSnapshot = () => {
    if (registeredRef.current && isActive) {
      return motionBridge.snapshot(entityId);
    }
    return null;
  };
  return { executeMotionCommand,getMotionSnapshot };
}

