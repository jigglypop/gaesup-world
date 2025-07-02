import { useEffect, useMemo, useRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getGlobalAnimationBridge } from '../../animation/hooks/useAnimationBridge';
import { MotionBridge } from '../bridge/MotionBridge';

interface UsePhysicsEntityProps {
  isActive: boolean;
  actions: Record<string, THREE.AnimationAction | null>;
  modeType?: string;
  rigidBody?: RapierRigidBody | null;
}

let globalMotionBridge: MotionBridge | null = null;

function getGlobalMotionBridge(): MotionBridge {
  if (!globalMotionBridge) {
    globalMotionBridge = new MotionBridge();
  }
  return globalMotionBridge;
}

export function usePhysicsEntity({
  isActive,
  actions,
  modeType,
  rigidBody
}: UsePhysicsEntityProps) {
  const animationBridgeRef = useRef<boolean>(false);
  const entityIdRef = useRef<string>(`entity-${Date.now()}-${Math.random()}`);
  const registeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (actions && modeType && isActive && !animationBridgeRef.current) {
      const animationBridge = getGlobalAnimationBridge();
      animationBridge.registerAnimations(modeType as any, actions);
      animationBridgeRef.current = true;
      
      return () => {
        if (animationBridgeRef.current) {
          animationBridge.unregisterAnimations(modeType as any);
          animationBridgeRef.current = false;
        }
      };
    }
  }, [actions, modeType, isActive]);

  useEffect(() => {
    if (isActive && rigidBody && !registeredRef.current) {
      const motionBridge = getGlobalMotionBridge();
      motionBridge.registerEntity(
        entityIdRef.current,
        modeType === 'vehicle' || modeType === 'airplane' ? 'vehicle' : 'character',
        rigidBody
      );
      registeredRef.current = true;

      return () => {
        if (registeredRef.current) {
          motionBridge.unregisterEntity(entityIdRef.current);
          registeredRef.current = false;
        }
      };
    }
  }, [isActive, rigidBody, modeType]);

  const executeMotionCommand = useMemo(
    () => (command: any) => {
      if (registeredRef.current && isActive) {
        const motionBridge = getGlobalMotionBridge();
        motionBridge.execute(entityIdRef.current, command);
      }
    },
    [isActive]
  );

  const updateMotion = useMemo(
    () => (deltaTime: number) => {
      if (registeredRef.current && isActive) {
        const motionBridge = getGlobalMotionBridge();
        motionBridge.updateEntity(entityIdRef.current, deltaTime);
      }
    },
    [isActive]
  );

  const getMotionSnapshot = useMemo(
    () => () => {
      if (registeredRef.current && isActive) {
        const motionBridge = getGlobalMotionBridge();
        return motionBridge.snapshot(entityIdRef.current);
      }
      return null;
    },
    [isActive]
  );

  return {
    executeMotionCommand,
    updateMotion,
    getMotionSnapshot
  };
} 