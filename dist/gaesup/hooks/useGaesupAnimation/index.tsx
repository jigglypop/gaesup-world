import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { animationAtomType } from "../../world/context/type";

export function useGaesupAnimation({
  type,
}: {
  type: "character" | "vehicle" | "airplane";
}) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const getAnimationTag = (tag: string): { name: string; isValid: boolean } => {
    const animation: animationAtomType = animationState[type].store[tag];
    if (!animation)
      return { name: animationState[type].default, isValid: false };
    if (animation.condition()) {
      return { name: animation.animationName, isValid: true };
    } else {
      return { name: animationState[type].default, isValid: false };
    }
  };

  const notify = () => {
    let tag = animationState[type].default;
    for (const key of Object.keys(animationState[type].store)) {
      const checked = getAnimationTag(key);
      if (checked.isValid) {
        tag = checked.name;
        break;
      }
    }
    animationState[type].current = tag;
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
    return tag;
  };

  const unsubscribe = (tag: string) => {
    delete animationState[type].store[tag];
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
  };

  const subscribe = ({
    tag,
    condition,
    action,
    animationName,
    key,
  }: animationAtomType) => {
    animationState[type].store[tag] = {
      condition,
      action: action || (() => {}),
      animationName: animationName || tag,
      key: key || tag,
    };
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
  };

  const subscribeAll = (props: animationAtomType[]) => {
    const subscribedTags: string[] = [];

    props.forEach((item) => {
      animationState[type].store[item.tag] = {
        condition: item.condition,
        action: item.action,
        animationName: item.animationName,
        key: item.key,
      };
      subscribedTags.push(item.tag);
    });

    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });

    // 구독 해제 함수 반환
    return () => {
      subscribedTags.forEach((tag) => {
        delete animationState[type].store[tag];
      });
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
          },
        },
      });
    };
  };

  return {
    subscribe,
    subscribeAll,
    store: animationState?.[type].store,
    unsubscribe,
    notify,
  };
}
