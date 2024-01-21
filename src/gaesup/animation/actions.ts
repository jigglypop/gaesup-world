import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Ref, useContext, useEffect } from "react";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
  Object3DEventMap,
} from "three";
import { animationTagType, groundRayType } from "../controller/type";
import { useGaesupAnimation } from "../hooks/useGaesupAnimation";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context";

export type Api<T extends AnimationClip> = {
  ref: React.MutableRefObject<Object3D | undefined | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: T["name"][];
  actions: {
    [key in T["name"]]: AnimationAction | null;
  };
};

export type playActionsType = {
  type: "character" | "vehicle" | "airplane";
  animationResult: Api<AnimationClip>;
  currentAnimation?: string;
};

export type subscribeActionsType = {
  type: "character" | "vehicle" | "airplane";
  groundRay: groundRayType;
  animations: AnimationClip[];
};

export type actionsType = {
  [x: string]: THREE.AnimationAction | null;
};

export type playResultType = {
  actions: actionsType;
  ref: Ref<Object3D<Object3DEventMap>>;
};

export function subscribeActions({
  type,
  groundRay,
  animations,
}: subscribeActionsType) {
  const { states, activeState } = useContext(GaesupWorldContext);
  const { subscribeAll } = useGaesupAnimation({ type });
  const animationResult = useAnimations(animations);

  // 초기 기본 애니메이션 등록
  useEffect(() => {
    subscribeAll([
      {
        tag: "walk",
        condition: () => !states.isRunning && states.isMoving,
        action: () => {},
        animationName: "walk",
        key: "walk",
      },
      {
        tag: "run",
        condition: () => states.isRunning,
        action: () => {},
        animationName: "run",
        key: "run",
      },
      {
        tag: "jump",
        condition: () => states.isJumping,
        action: () => {},
        animationName: "jump",
        key: "jump",
      },
      {
        tag: "fall",
        condition: () => groundRay.hit === null && activeState.velocity.y < 0,
        action: () => {},
        animationName: "fall",
        key: "fall",
      },
      {
        tag: "ride",
        condition: () => states.isPush["keyR"],
        action: () => {},
        animationName: "ride",
        key: "ride",
      },
    ]);
  }, []);

  return {
    animationResult,
  };
}

export default function playActions({
  type,
  animationResult,
  currentAnimation,
}: playActionsType) {
  const { mode, animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { notify, store } = useGaesupAnimation({ type });
  const { actions, ref } = animationResult;

  const play = (tag: keyof animationTagType) => {
    animationState[type].current = tag;
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
  };

  useEffect(() => {
    const action = actions[currentAnimation || animationState[type].current]
      ?.reset()
      .fadeIn(0.2)
      .play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [currentAnimation, animationState[type].current, mode.type]);

  useFrame(() => {
    if (!currentAnimation) {
      const tag = notify() as keyof animationTagType;
      play(tag);
    }
  });

  return {
    animationRef: ref,
    currentAnimation: animationState?.[type]?.current,
  };
}
