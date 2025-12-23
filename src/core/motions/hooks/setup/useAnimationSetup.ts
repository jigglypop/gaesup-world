import { useRef, useEffect } from 'react';

import type { AnimationAction } from 'three';

import { ModeType } from '@stores/slices';

import { getGlobalAnimationBridge } from '../../../animation/hooks/useAnimationBridge';

export function useAnimationSetup(
  actions: Record<string, AnimationAction | null> | undefined,
  modeType: ModeType,
  isActive: boolean
) {
  const animationBridgeRef = useRef<boolean>(false);
  useEffect(() => {
    if (actions && modeType && isActive && !animationBridgeRef.current) {
      const animationBridge = getGlobalAnimationBridge();
      animationBridge.registerAnimations(modeType as 'character' | 'vehicle' | 'airplane', actions);
      animationBridgeRef.current = true;
      return () => {
        if (animationBridgeRef.current) {
          animationBridge.unregisterAnimations(modeType as 'character' | 'vehicle' | 'airplane');
          animationBridgeRef.current = false;
        }
      };
    }
  }, [actions, modeType, isActive]);
}

