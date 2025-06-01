import { useCallback, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  getAnimationAtom, 
  createCurrentAnimationAtom, 
  createAnimationStoreAtom,
  createAnimationSubscriptionAtom 
} from "../../atoms/animationAtoms";
import { AnimationAtomType } from "../../types";

export function useGaesupAnimation({
  type,
}: {
  type: "character" | "vehicle" | "airplane";
}) {
  const animationAtom = useMemo(() => getAnimationAtom(type), [type]);
  const currentAnimationAtom = useMemo(() => createCurrentAnimationAtom(type), [type]);
  const storeAtom = useMemo(() => createAnimationStoreAtom(type), [type]);
  const subscriptionAtom = useMemo(() => createAnimationSubscriptionAtom(type), [type]);

  const animationState = useAtomValue(animationAtom);
  const [currentAnimation, setCurrentAnimation] = useAtom(currentAnimationAtom);
  const [store, setStore] = useAtom(storeAtom);
  const subscribeAction = useSetAtom(subscriptionAtom);

  const notify = useCallback(() => {
    let tag = animationState.default;
    for (const key in store) {
      const animation = store[key];
      if (animation?.condition()) {
        tag = animation.animationName || key;
        break;
      }
    }
    if (currentAnimation !== tag) {
      setCurrentAnimation(tag);
    }
    return tag;
  }, [store, animationState.default, currentAnimation, setCurrentAnimation]);

  const unsubscribe = useCallback((tag: string) => {
    subscribeAction({ type: 'unsubscribe', tag });
  }, [subscribeAction]);

  const subscribe = useCallback(({
    tag,
    condition,
    action,
    animationName,
    key,
  }: AnimationAtomType) => {
    const newAnimation = {
      tag,
      condition,
      action: action || (() => {}),
      animationName: animationName || tag,
      key: key || tag,
    };
    subscribeAction({ type: 'subscribe', tag, animation: newAnimation });
  }, [subscribeAction]);

  const subscribeAll = useCallback((props: AnimationAtomType[]) => {
    const subscribedTags: string[] = [];
    const newStore = { ...store };
    let hasChanges = false;
    props.forEach((item) => {
      const currentAnimation = newStore[item.tag];
      const newAnimation = {
        tag: item.tag,
        condition: item.condition,
        action: item.action,
        animationName: item.animationName,
        key: item.key,
      };

      if (!currentAnimation || 
          currentAnimation.animationName !== item.animationName ||
          currentAnimation.tag !== item.tag) {
        newStore[item.tag] = newAnimation;
        hasChanges = true;
      }
      subscribedTags.push(item.tag);
    });
    if (hasChanges) {
      setStore(newStore);
    }
    return () => {
      subscribedTags.forEach((tag) => {
        subscribeAction({ type: 'unsubscribe', tag });
      });
    };
  }, [store, setStore, subscribeAction]);

  return {
    subscribe,
    subscribeAll,
    store,
    unsubscribe,
    notify,
    current: currentAnimation,
  };
}
