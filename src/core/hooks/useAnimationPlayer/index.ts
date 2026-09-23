import type { AnimationAction } from 'three';

import { useCharacterAnimator } from '@/core/motions/hooks/useCharacterAnimator';
import { useGaesupStore } from '@stores/gaesupStore';

type AnimationActions = Record<string, AnimationAction | null | undefined>;

/**
 * 활성 이동 모드의 기본 Animator를 구동한다. 새 코드는 useCharacterAnimator를 직접 사용한다.
 * @deprecated useCharacterAnimator를 사용한다.
 */
export function useAnimationPlayer(active: boolean) {
  const modeType = useGaesupStore((state) => state.mode?.type) ?? 'character';
  useCharacterAnimator({ enabled: active, type: modeType });
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
