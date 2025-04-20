import { useCallback, useMemo, useContext } from 'react';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';
import { animationAtomType } from '../../world/context/type';

export function useGaesupAnimation({ type }: { type: 'character' | 'vehicle' | 'airplane' }) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const currentTypeAnimState = useMemo(() => {
    return animationState[type] || { current: 'idle', default: 'idle', store: {} };
  }, [animationState, type]);
  const store = useMemo(() => currentTypeAnimState.store, [currentTypeAnimState.store]);

  const updateAnimationState = useCallback(() => {
    dispatch({
      type: 'update',
      payload: {
        animationState: { ...animationState },
      },
    });
  }, [dispatch, animationState]);

  const getAnimationTag = useCallback(
    (tag: string): { name: string; isValid: boolean } => {
      const animation = store[tag];
      if (!animation) {
        return { name: currentTypeAnimState.default, isValid: false };
      }
      return {
        name: animation.condition() ? animation.animationName || tag : currentTypeAnimState.default,
        isValid: animation.condition(),
      };
    },
    [store, currentTypeAnimState.default],
  );

  const subscribe = useCallback(
    (props: animationAtomType) => {
      if (!store[props.tag]) {
        store[props.tag] = props;
        updateAnimationState();
      }
    },
    [store, updateAnimationState],
  );

  // Memoize unsubscribe function
  const unsubscribe = useCallback(
    (tag: string) => {
      if (store[tag]) {
        delete store[tag];
        updateAnimationState();
      }
    },
    [store, updateAnimationState],
  );

  // Add back the subscribeAll function
  const subscribeAll = useCallback(
    (props: animationAtomType[]) => {
      const subscribedTags: string[] = [];

      // Register all animations
      props.forEach((item) => {
        store[item.tag] = {
          condition: item.condition,
          action: item.action || (() => {}),
          animationName: item.animationName || item.tag,
          key: item.key || item.tag,
        };
        subscribedTags.push(item.tag);
      });

      updateAnimationState();

      // Return cleanup function
      return () => {
        subscribedTags.forEach((tag) => {
          if (store[tag]) {
            delete store[tag];
          }
        });
        updateAnimationState();
      };
    },
    [store, updateAnimationState],
  );

  // Add back the notify function
  const notify = useCallback(() => {
    // Set default animation as initial value
    let tag = currentTypeAnimState.default;
    // Check conditions for all registered animations
    for (const key of Object.keys(store)) {
      const checked = getAnimationTag(key);
      if (checked.isValid) {
        tag = checked.name;
        break;
      }
    }
    // Update current animation (only if different from previous)
    if (currentTypeAnimState.current !== tag) {
      animationState[type].current = tag;
      updateAnimationState();
    }
    return tag;
  }, [animationState, currentTypeAnimState, getAnimationTag, type, updateAnimationState]);

  return {
    store,
    subscribe,
    subscribeAll,
    unsubscribe,
    getAnimationTag,
    currentTypeAnimState,
    notify,
  };
}
