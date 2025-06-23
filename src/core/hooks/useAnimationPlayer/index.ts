import { useEffect, useMemo, useRef } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { AnimationActions } from './types';

export function useAnimationPlayer(actions: AnimationActions | undefined, active: boolean) {
  const keyboard = useGaesupStore((state) => state.interaction?.keyboard);
  const mouse = useGaesupStore((state) => state.interaction?.mouse);
  const automation = useGaesupStore((state) => state.automation);
  const states = useGaesupStore((state) => state.states);

  const movement = useMemo(() => {
    const isKeyboardMoving =
      keyboard?.forward ||
      keyboard?.backward ||
      keyboard?.leftward ||
      keyboard?.rightward;
    const isPointerMoving = mouse?.isActive || false;
    return {
      isMoving: isKeyboardMoving || isPointerMoving,
      isRunning:
        (keyboard?.shift && isKeyboardMoving) ||
        (mouse?.shouldRun && isPointerMoving && automation?.queue.isRunning),
    };
  }, [keyboard, mouse, automation]);

  const activeTag = (() => {
    if (states?.isJumping) return 'jump';
    if (states?.isFalling) return 'fall';
    if (states?.isRiding) return 'ride';
    if (states?.isLanding) return 'land';
    if (movement.isRunning) return 'run';
    if (movement.isMoving) return 'walk';
    return 'idle';
  })();

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
