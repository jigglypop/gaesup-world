import { useRef, useCallback, useEffect } from 'react';
import { useGaesupStore } from '../../stores/gaesupStore';
import { BridgeFactory } from '../../boilerplate';
import { AnimationBridge } from '../bridge/AnimationBridge';
import { AnimationType } from '../core/types';
import * as THREE from 'three';
import { AnimationCommand } from '../bridge/types';

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
      const currentStoreAnimation =
        useGaesupStore.getState().animationState?.[type]?.current;
      if (snapshot.currentAnimation !== currentStoreAnimation) {
        setAnimation(type, snapshot.currentAnimation);
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