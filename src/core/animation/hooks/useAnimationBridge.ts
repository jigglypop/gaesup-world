import { useRef, useCallback, useEffect } from 'react';

import * as THREE from 'three';

import { BridgeFactory } from '../../boilerplate';
import { useGaesupStore } from '../../stores/gaesupStore';
import { AnimationBridge } from '../bridge/AnimationBridge';
import { AnimationCommand } from '../bridge/types';
import { AnimationType } from '../core/types';
import type { EntityAnimationStates } from '../core/types';

export function getGlobalAnimationBridge(): AnimationBridge {
  let bridge = BridgeFactory.get<AnimationBridge>('animation');
  if (!bridge) {
    bridge = BridgeFactory.create<AnimationBridge>('animation');
  }
  return bridge!;
}

export function useAnimationBridge() {
  const bridgeRef = useRef<AnimationBridge | null>(null);
  const mode = useGaesupStore((state) => state.mode);
  const animationState = useGaesupStore((state) => state.animationState);
  const setAnimation = useGaesupStore((state) => state.setAnimation);
  const bridge = getGlobalAnimationBridge();

  useEffect(() => {
    bridgeRef.current = bridge;
    const unsubscribe = bridge.subscribe((snapshot, type) => {
      if (!snapshot) return;
      const engineType = type as keyof EntityAnimationStates;
      const currentStoreAnimation =
        useGaesupStore.getState().animationState?.[engineType]?.current;
      if (snapshot.currentAnimation !== currentStoreAnimation) {
        setAnimation(engineType, snapshot.currentAnimation);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setAnimation, bridge]);

  const executeCommand = useCallback(
    (type: AnimationType, command: AnimationCommand) => {
      if (bridgeRef.current) {
        bridgeRef.current.execute(type, command);
      }
    },
    [],
  );

  const playAnimation = useCallback(
    (type: AnimationType, animation: string) => {
      executeCommand(type, { type: 'play', animation });
    },
    [executeCommand],
  );

  const stopAnimation = useCallback(
    (type: AnimationType) => {
      executeCommand(type, { type: 'stop' });
    },
    [executeCommand],
  );

  const registerAnimations = useCallback(
    (
      type: AnimationType,
      actions: Record<string, THREE.AnimationAction | null>,
    ) => {
      if (bridgeRef.current) {
        bridgeRef.current.registerAnimations(type, actions);
      }
    },
    [],
  );
  
  const currentType = (mode?.type as AnimationType) || 'character';
  
  return {
    bridge: bridgeRef.current,
    playAnimation,
    stopAnimation,
    executeCommand,
    registerAnimations,
    currentType,
    currentAnimation: animationState?.[currentType]?.current || 'idle',
  };
} 