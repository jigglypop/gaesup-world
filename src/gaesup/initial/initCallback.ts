import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom, useAtomValue } from "jotai";
import { useContext, useEffect } from "react";
import { animationAtom } from "../stores/animation";
import { GaesupWorldContext, gaesupWorldPropType } from "../stores/context";
import useCalcControl from "../stores/control";
import { currentAtom } from "../stores/current";
import {
  animationTagType,
  callbackPropType,
  callbackType,
  propType,
} from "../type";

export type initCallbackType = {
  prop: propType;
  callbacks?: callbackType;
  animations: THREE.AnimationClip[];
};

export default function initCallback({
  prop,
  callbacks,
  animations,
}: initCallbackType) {
  const { outerGroupRef, rigidBodyRef, slopeRayOriginRef, capsuleColliderRef } =
    prop;
  const current = useAtomValue(currentAtom);
  const { states } = useContext<gaesupWorldPropType>(GaesupWorldContext);
  const { actions } = useAnimations(animations, outerGroupRef);
  const [animation, setAnimation] = useAtom(animationAtom);
  // Animation set state
  const playAnimation = (tag: keyof animationTagType) => {
    setAnimation((animation) => ({
      ...animation,
      current: tag,
    }));
  };

  const keyControl = useCalcControl(prop);
  const controllerProp: callbackPropType = {
    ...prop,
    keyControl,
    current,
    states,
  };

  useEffect(() => {
    if (rigidBodyRef && rigidBodyRef.current) {
      current.refs.rigidBodyRef = rigidBodyRef;
    }
    if (outerGroupRef && outerGroupRef.current) {
      current.refs.outerGroupRef = outerGroupRef;
    }
    if (capsuleColliderRef && capsuleColliderRef.current) {
      current.refs.capsuleColliderRef = capsuleColliderRef;
    }
    if (slopeRayOriginRef && slopeRayOriginRef.current) {
      current.refs.slopeRayOriginRef = slopeRayOriginRef;
    }
  }, []);

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
        animation,
        playAnimation,
      });
    }
  });
}
