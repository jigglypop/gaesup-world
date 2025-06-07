import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { activeAnimationAtom } from '@/gaesup/atoms/animationAtoms';
import { AnimationAction } from 'three';

export function useAnimationPlayer(
  actions: { [x: string]: AnimationAction | null } | undefined,
  active: boolean,
) {
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
      // 일부 모델은 특정 애니메이션(예: 점프)이 없을 수 있습니다.
      // 이 경우, 기본 애니메이션(idle)으로 대체하거나 아무것도 하지 않을 수 있습니다.
      // 여기서는 console.warn으로 경고를 표시하고 idle로 대체합니다.
      currentAction.reset().fadeIn(0.2).play();
    }

    previousTag.current = activeTag;
  }, [activeTag, actions, active]);
}
