import { useRef, useEffect, RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';

import { ModeType } from '@stores/slices';

import { MotionCommand } from '../../bridge/types';
import { useWorldMotionBridge } from '../useWorldMotionBridge';

export function useMotionSetup(
  entityId: string,
  rigidBodyRef: RefObject<RapierRigidBody>,
  modeType: ModeType,
  isActive: boolean
) {
  const registeredRef = useRef<boolean>(false);
  const bridge = useWorldMotionBridge();
  
  useEffect(() => {
    if (!rigidBodyRef.current || registeredRef.current || !bridge) return undefined;

    bridge.register(
      entityId,
      modeType === 'vehicle' || modeType === 'airplane'
        ? modeType
        : 'character',
      rigidBodyRef.current
    );
    registeredRef.current = true;
    return () => {
      bridge.unregister(entityId);
      registeredRef.current = false;
    };
  }, [rigidBodyRef, modeType, entityId, bridge]);

  useEffect(() => {
    if (!isActive || !bridge) return undefined;
    bridge.setPlayerEntity(entityId);
    return () => {
      if (bridge.getPlayerEntityId() === entityId) bridge.setPlayerEntity(null);
    };
  }, [isActive, entityId, bridge]);
  
  const executeMotionCommand = (command: MotionCommand) => {
    if (registeredRef.current && isActive && bridge) {
      bridge.execute(entityId, command);
    }
  };
  
  const getMotionSnapshot = () => {
    if (registeredRef.current && isActive && bridge) {
      return bridge.snapshot(entityId);
    }
    return null;
  };
  
  return { executeMotionCommand, getMotionSnapshot };
}

