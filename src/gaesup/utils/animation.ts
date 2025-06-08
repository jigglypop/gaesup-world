import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { activeAnimationAtom } from '../atoms/animationAtoms';

export interface AnimationActions {
  [key: string]: {
    fadeOut: (duration: number) => any;
    reset: () => any;
    fadeIn: (duration: number) => any;
    play: () => any;
  } | null;
}

export function useAnimationPlayer(actions: AnimationActions | undefined, active: boolean) {
  const activeTag = useAtomValue(activeAnimationAtom);
  const previousTag = useRef('idle');

  useEffect(() => {
    if (!active || !actions || activeTag === previousTag.current) return;

    const currentAction = actions[activeTag];
    const previousAction = actions[previousTag.current];

    if (previousAction && previousAction !== null) {
      previousAction.fadeOut(0.2);
    }

    if (currentAction && currentAction !== null) {
      currentAction.reset().fadeIn(0.2).play();
    }

    previousTag.current = activeTag;
  }, [activeTag, actions, active]);
}

// 애니메이션 상태 관리 유틸리티
export function createAnimationController(actions: AnimationActions) {
  return {
    playAnimation: (tag: string, fadeTime = 0.2) => {
      const action = actions[tag];
      if (action && action !== null) {
        action.reset().fadeIn(fadeTime).play();
      }
    },

    stopAnimation: (tag: string, fadeTime = 0.2) => {
      const action = actions[tag];
      if (action && action !== null) {
        action.fadeOut(fadeTime);
      }
    },

    crossFade: (from: string, to: string, fadeTime = 0.2) => {
      const fromAction = actions[from];
      const toAction = actions[to];

      if (fromAction && fromAction !== null) fromAction.fadeOut(fadeTime);
      if (toAction && toAction !== null) toAction.reset().fadeIn(fadeTime).play();
    },
  };
}
