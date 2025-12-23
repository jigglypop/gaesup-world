import { useEffect, useMemo } from 'react';

import { useInteractionSystem } from '@/core/motions/hooks/useInteractionSystem';
import { useGaesupStore } from '@stores/gaesupStore';
import type { AnimationAction } from 'three';

import { useAnimationBridge } from '../../animation/hooks/useAnimationBridge';
import { useStateSystem } from '../../motions/hooks/useStateSystem';

type AnimationActions = Record<string, AnimationAction | null | undefined>;

export function useAnimationPlayer(active: boolean) {
  const { playAnimation, currentType, currentAnimation } = useAnimationBridge();
  const { keyboard, mouse } = useInteractionSystem();
  const automation = useGaesupStore((state) => state.automation);
  const { gameStates } = useStateSystem();
  
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
  }, [keyboard.forward, keyboard.backward, keyboard.leftward, keyboard.rightward, keyboard.shift, mouse.isActive, mouse.shouldRun, automation]);

  const autoActiveTag = useMemo(() => {
    if (gameStates?.isJumping) return 'jump';
    if (gameStates?.isFalling) return 'fall';
    if (gameStates?.isRiding) return 'ride';
    if (movement.isRunning) return 'run';
    if (movement.isMoving) return 'walk';
    return 'idle';
  }, [gameStates.isJumping, gameStates.isFalling, gameStates.isRiding, movement.isRunning, movement.isMoving]);
  const movementAnimations = useMemo(() => ['idle', 'walk', 'run', 'jump', 'fall', 'ride', 'land'], []);

  useEffect(() => {
    if (!active) return;
    
    const isMoving = autoActiveTag !== 'idle';

    if (isMoving) {
      if (autoActiveTag !== currentAnimation) {
        playAnimation(currentType, autoActiveTag);
      }
    } else { 
      if (movementAnimations.includes(currentAnimation) && currentAnimation !== 'idle') {
        playAnimation(currentType, 'idle');
      }
    }
  }, [active, autoActiveTag, currentAnimation, playAnimation, currentType, movementAnimations]);
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
