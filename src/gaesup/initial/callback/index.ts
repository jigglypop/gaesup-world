import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";

import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { animationTagType } from "../../controller/type";

import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../stores/context/gaesupworld";
import { callbackPropType, initCallbackType } from "./type";

export default function initCallback({
  prop,
  callbacks,
  outerGroupRef,
}: initCallbackType) {
  const {
    characterGltf,
    animations: characterAnimations,
    activeState,
    states,
  } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { animations } = characterGltf;
  const control = useKeyboardControls()[1]();
  const { actions } = useAnimations(animations, outerGroupRef);

  const playAnimation = (tag: keyof animationTagType) => {
    characterAnimations.current = tag;
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...characterAnimations,
        },
      },
    });
  };

  const controllerProp: callbackPropType = {
    ...prop,
    activeState,
    control,
    states,
  };

  useEffect(() => {
    if (callbacks && callbacks.onReady) {
      callbacks.onReady(controllerProp);
    }
    return () => {
      if (callbacks && callbacks.onDestory) {
        callbacks.onDestory(controllerProp);
      }
    };
  }, []);

  useFrame((prop) => {
    if (callbacks && callbacks.onFrame) {
      callbacks.onFrame({ ...controllerProp, ...prop });
    }
    if (callbacks && callbacks.onAnimate) {
      callbacks.onAnimate({
        ...controllerProp,
        ...prop,
        actions,
        animation: characterAnimations,
        playAnimation,
      });
    }
  });
}
