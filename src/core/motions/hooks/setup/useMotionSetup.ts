import { useRef, useEffect, RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';

import { BridgeFactory } from '@core/boilerplate';
import { ModeType } from '@stores/slices';

import { MotionBridge } from '../../bridge/MotionBridge';
import { MotionCommand } from '../../bridge/types';

export function useMotionSetup(
  entityId: string,
  rigidBodyRef: RefObject<RapierRigidBody>,
  modeType: ModeType,
  isActive: boolean
) {
  const registeredRef = useRef<boolean>(false);
  const motionBridgeRef = useRef<MotionBridge | null>(null);
  
  // Bridge 인스턴스 한번만 가져오기
  if (!motionBridgeRef.current) {
    motionBridgeRef.current = BridgeFactory.getOrCreate('motion') as MotionBridge | null;
  }
  
  useEffect(() => {
    if (!rigidBodyRef.current || registeredRef.current || !motionBridgeRef.current) return undefined;

    motionBridgeRef.current.register(
      entityId,
      modeType === 'vehicle' || modeType === 'airplane'
        ? 'vehicle'
        : 'character',
      rigidBodyRef.current
    );
    registeredRef.current = true;
    return () => {
      motionBridgeRef.current?.unregister(entityId);
      registeredRef.current = false;
    };
  }, [rigidBodyRef, modeType, entityId]);
  
  const executeMotionCommand = (command: MotionCommand) => {
    if (registeredRef.current && isActive && motionBridgeRef.current) {
      motionBridgeRef.current.execute(entityId, command);
    }
  };
  
  const getMotionSnapshot = () => {
    if (registeredRef.current && isActive && motionBridgeRef.current) {
      return motionBridgeRef.current.snapshot(entityId);
    }
    return null;
  };
  
  return { executeMotionCommand, getMotionSnapshot };
}

