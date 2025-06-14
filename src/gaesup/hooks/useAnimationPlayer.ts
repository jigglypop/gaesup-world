import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
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
  // This logic will be moved to a Zustand slice later
  const gameStates = useGaesupStore((state) => state.states);
  const activeAnimation = (() => {
    if (gameStates.isJumping) return 'jump';
    if (gameStates.isFalling) return 'fall';
    if (gameStates.isRiding) return 'ride';
    if (gameStates.isLanding) return 'land';
    if (gameStates.isRunning) return 'run';
    if (gameStates.isMoving) return 'walk';
    return 'idle';
  })();

  const previousTag = useRef('idle');

  useEffect(() => {
    if (!active || !actions || activeAnimation === previousTag.current) return;

    const currentAction = actions[activeAnimation];
    const previousAction = actions[previousTag.current];

    if (previousAction && previousAction !== null) {
      previousAction.fadeOut(0.2);
    }

    if (currentAction && currentAction !== null) {
      currentAction.reset().fadeIn(0.2).play();
    }

    previousTag.current = activeAnimation;
  }, [activeAnimation, actions, active]);
}
