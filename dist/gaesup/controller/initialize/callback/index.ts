import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { AnimationAction } from "three";
import { rigidBodyRefType } from "../../../component/inner/common/type";
import { componentTypeString } from "../../../component/passive/type";
import { useGaesupAnimation } from "../../../hooks/useGaesupAnimation";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../../world/context";
import { animationTagType } from "../../type";
import { callbackPropType } from "./type";

export default function initCallback({
  props,
  actions,
  componentType,
}: {
  props: rigidBodyRefType;
  actions: {
    [x: string]: AnimationAction;
  };
  componentType: componentTypeString;
}) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { store } = useGaesupAnimation({ type: componentType });
  const { activeState, states, control } = useContext(GaesupWorldContext);
  const { subscribe } = useGaesupAnimation({ type: componentType });

  const playAnimation = (tag: keyof animationTagType, key: string) => {
    if (!(key in control)) return;
    if (control[key] && animationState[componentType]) {
      animationState[componentType].current = tag;
      const currentAnimation = store[tag];
      if (currentAnimation?.action) {
        currentAnimation.action();
      }
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
          },
        },
      });
    }
  };

  const controllerProp: callbackPropType = {
    activeState,
    control,
    states,
    subscribe,
  };

  useEffect(() => {
    if (props.onReady) {
      props.onReady(controllerProp);
    }
    return () => {
      if (props.onDestory) {
        props.onDestory(controllerProp);
      }
    };
  }, []);

  useFrame((prop) => {
    if (props.onFrame) {
      props.onFrame({ ...controllerProp, ...prop });
    }
    if (props.onAnimate) {
      props.onAnimate({
        ...controllerProp,
        ...prop,
        actions,
        animationState,
        playAnimation,
      });
    }
  });

  return {
    subscribe,
    playAnimation,
    dispatch,
  };
}
