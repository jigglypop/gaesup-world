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
    // A freshly loaded or swapped rig has no running action even when the
    // controller's logical state already says "idle".
    if (ownedActions['idle']) animationBridge.execute(modeType, { type: 'play', animation: 'idle' });

    return () => {
      animationBridge.unregisterAnimations(modeType as 'character' | 'vehicle' | 'airplane', ownedActions);
    };
  }, [actions, modeType, isActive]);
}

