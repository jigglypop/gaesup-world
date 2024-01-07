import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { animationAtomType } from "../../world/context/type";

export function useGaesupAnimation() {
  const { animations } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const getAnimationTag = (tag: string): { name: string; isValid: boolean } => {
    const animation: animationAtomType = animations.store[tag];
    if (!animation) return { name: animations.default, isValid: false };
    if (animation.condition()) {
      return { name: animation.animationName, isValid: true };
    } else {
      return { name: animations.default, isValid: false };
    }
  };

  const notify = () => {
    let tag = animations.default;
    for (const key of Object.keys(animations.store)) {
      const checked = getAnimationTag(key);
      if (checked.isValid) {
        tag = checked.name;
        break;
      }
    }
    animations.current = tag;
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
    return tag;
  };

  const unsubscribe = (tag: string) => {
    delete animations.store[tag];
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
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
    animations.store[tag] = {
      condition,
      action: action || (() => {}),
      animationName: animationName || tag,
      key: key || tag,
    };
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
  };

  const subscribeAll = (props: animationAtomType[]) => {
    props.forEach((item) => {
      animations.store[item.tag] = {
        condition: item.condition,
        action: item.action,
        animationName: item.animationName,
        key: item.key,
      };
    });
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
  };

  return {
    subscribe,
    subscribeAll,
    store: animations.store,
    unsubscribe,
    notify,
  };
}
