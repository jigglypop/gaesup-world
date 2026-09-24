import { useEffect, useRef } from 'react';

import { useScopedAnimationBridge } from './useAnimationBridge';
import type { AnimatorEventListener } from '../core/animator/types';
import type { AnimationType } from '../core/types';

export function useAnimatorEvent(
  listener: AnimatorEventListener,
  type: AnimationType = 'character',
  eventName?: string,
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  const bridge = useScopedAnimationBridge();

  useEffect(() => {
    if (!bridge) return undefined;
    return bridge.onAnimatorEvent(type, (event) => {
      if (eventName !== undefined && event.name !== eventName) return;
      listenerRef.current(event);
    });
  }, [bridge, type, eventName]);
}
