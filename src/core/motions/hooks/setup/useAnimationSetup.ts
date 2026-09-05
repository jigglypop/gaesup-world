import { useEffect } from 'react';

import type { AnimationAction } from 'three';

import { ModeType } from '@stores/slices';

import { getGlobalAnimationBridge } from '../../../animation/hooks/useAnimationBridge';

export function useAnimationSetup(
  actions: Record<string, AnimationAction | null> | undefined,
  modeType: ModeType,
  isActive: boolean
) {
  useEffect(() => {
    if (!actions || !isActive) return undefined;
    const animationBridge = getGlobalAnimationBridge();
    const ownedActions = { ...actions };
    animationBridge.registerAnimations(modeType as 'character' | 'vehicle' | 'airplane', ownedActions);

    return () => {
      animationBridge.unregisterAnimations(modeType as 'character' | 'vehicle' | 'airplane', ownedActions);
    };
  }, [actions, modeType, isActive]);
}

