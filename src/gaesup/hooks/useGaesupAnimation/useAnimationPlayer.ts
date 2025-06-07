import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { activeAnimationAtom } from '@/gaesup/atoms/animationAtoms';
import { AnimationActions } from './types';

export function useAnimationPlayer(actions: AnimationActions | undefined, active: boolean) {
  const activeTag = useAtomValue(activeAnimationAtom);
  const previousTag = useRef('idle');

  useEffect(() => {
    if (!active || !actions || activeTag === previousTag.current) return;
    const currentAction = actions[activeTag];
    const previousAction = actions[previousTag.current];
    if (previousAction) {
      previousAction.fadeOut(0.2);
    }
    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play();
    }
    previousTag.current = activeTag;
  }, [activeTag, actions, active]);
}
