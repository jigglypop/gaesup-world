import { useEffect, useRef } from 'react';

import { getGlobalAnimationBridge } from './useAnimationBridge';
import type { AnimatorEventListener } from '../core/animator/types';
import type { AnimationType } from '../core/types';

export function useAnimatorEvent(
  listener: AnimatorEventListener,
  type: AnimationType = 'character',
  eventName?: string,
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    return getGlobalAnimationBridge().onAnimatorEvent(type, (event) => {
      if (eventName !== undefined && event.name !== eventName) return;
      listenerRef.current(event);
    });
  }, [type, eventName]);
}
