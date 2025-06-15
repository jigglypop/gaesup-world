import { useEffect, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import { useGaesupStore } from '../stores/gaesupStore';

export interface AnimationActions {
  [key: string]: {
    fadeOut: (duration: number) => any;
    reset: () => any;
    fadeIn: (duration: number) => any;
    play: () => any;
  } | null;
}

export function useAnimationPlayer(actions: AnimationActions | undefined, active: boolean) {
  const states = useGaesupStore((state) => state.states, shallow);

  const activeAnimation = (() => {
    if (states.isJumping) return 'jump';
    if (states.isFalling) return 'fall';
    if (states.isRiding) return 'ride';
    if (states.isLanding) return 'land';
    if (states.isRunning) return 'run';
    if (states.isMoving) return 'walk';
    return 'idle';
  })();

  const previousTag = useRef('idle');

  useEffect(() => {
    if (!active || !actions || activeAnimation === previousTag.current) return;

    const currentAction = actions[activeAnimation];
    const previousAction = actions[previousTag.current];

    if (previousAction) {
      previousAction.fadeOut(0.2);
    }

    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play();
    }

    previousTag.current = activeAnimation;
  }, [activeAnimation, actions, active]);
}
