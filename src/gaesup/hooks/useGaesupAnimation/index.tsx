import { useContext, useCallback } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { AnimationAtomType } from "../../types";

export function useGaesupAnimation({
  type,
}: {
  type: "character" | "vehicle" | "airplane";
}) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const getAnimationTag = (tag: string): { name: string; isValid: boolean } => {
    const animation: AnimationAtomType = animationState[type].store[tag];
    if (!animation)
      return { name: animationState[type].default, isValid: false };
    if (animation.condition()) {
      return { name: animation.animationName, isValid: true };
    } else {
      return { name: animationState[type].default, isValid: false };
    }
  };

  const notify = useCallback(() => {
    let tag = animationState[type].default;
    const store = animationState[type].store;
    
    for (const key of Object.keys(store)) {
      const animation = store[key];
      if (animation?.condition()) {
        tag = animation.animationName || key;
        break;
      }
    }
    
    // 현재 애니메이션과 다를 때만 업데이트
    if (animationState[type].current !== tag) {
      animationState[type].current = tag;
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
            [type]: {
              ...animationState[type],
              current: tag
            }
          },
        },
      });
    }
    return tag;
  }, [animationState, type, dispatch]);

  const unsubscribe = useCallback((tag: string) => {
    delete animationState[type].store[tag];
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
          [type]: {
            ...animationState[type],
            store: { ...animationState[type].store }
          }
        },
      },
    });
  }, [animationState, type, dispatch]);

  const subscribe = useCallback(({
    tag,
    condition,
    action,
    animationName,
    key,
  }: AnimationAtomType) => {
    const currentStore = animationState[type].store[tag];
    const newAnimation = {
      tag,
      condition,
      action: action || (() => {}),
      animationName: animationName || tag,
      key: key || tag,
    };
    
    // 이미 같은 애니메이션이 등록되어 있으면 스킵
    if (currentStore && 
        currentStore.tag === tag && 
        currentStore.animationName === animationName) {
      return;
    }
    
    animationState[type].store[tag] = newAnimation;
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
          [type]: {
            ...animationState[type],
            store: { ...animationState[type].store, [tag]: newAnimation }
          }
        },
      },
    });
  }, [animationState, type, dispatch]);

  const subscribeAll = useCallback((props: AnimationAtomType[]) => {
    const subscribedTags: string[] = [];
    const newStore = { ...animationState[type].store };
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
      
      // 변경된 경우에만 업데이트
      if (!currentAnimation || 
          currentAnimation.animationName !== item.animationName ||
          currentAnimation.tag !== item.tag) {
        newStore[item.tag] = newAnimation;
        hasChanges = true;
      }
      subscribedTags.push(item.tag);
    });

    if (hasChanges) {
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
            [type]: {
              ...animationState[type],
              store: newStore
            }
          },
        },
      });
    }

    // 구독 해제 함수 반환
    return () => {
      const cleanedStore = { ...animationState[type].store };
      subscribedTags.forEach((tag) => {
        delete cleanedStore[tag];
      });
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
            [type]: {
              ...animationState[type],
              store: cleanedStore
            }
          },
        },
      });
    };
  }, [animationState, type, dispatch]);

  return {
    subscribe,
    subscribeAll,
    store: animationState?.[type].store,
    unsubscribe,
    notify,
  };
}
