import { useFrame } from "@react-three/fiber";
import { Ref, useContext, useEffect } from "react";
import * as THREE from "three";
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
  currentAnimation?: string;
  actions: actionsType;
  animationRef: Ref<Object3D<Object3DEventMap>>;
  isActive: boolean;
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

export function subscribeActions({ type }: subscribeActionsType) {
  const { states } = useContext(GaesupWorldContext);
  const { subscribeAll } = useGaesupAnimation({ type });
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
        tag: "ride",
        condition: () => states.isPush["keyR"],
        action: () => {},
        animationName: "ride",
        key: "ride",
      },
      {
        tag: "land",
        condition: () => states.isLanding,
        action: () => {},
        animationName: "land",
        key: "land",
      },
      {
        tag: "fall",
        condition: () => states.isFalling,
        action: () => {},
        animationName: "fall",
        key: "fall",
      },
    ]);
  }, []);
}

export default function playActions({
  type,
  actions,
  animationRef,
  currentAnimation,
  isActive,
}: playActionsType) {
  const { mode, animationState, block } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { notify, store } = useGaesupAnimation({ type });

  if (isActive) {
    currentAnimation = animationState?.[type]?.current;
  }

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
    let animation = "idle";
    if (block.animation) {
      animation = "idle";
    } else if (currentAnimation) {
      animation = currentAnimation;
    } else if (animationState[type].current) {
      animation = animationState[type].current;
    }
    const action = actions[animation]?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [currentAnimation, mode.type, block.animation, type]);

  useFrame(() => {
    if (isActive) {
      const tag = notify() as keyof animationTagType;
      play(tag);
    }
  });

  return {
    animationRef,
    currentAnimation: animationState?.[type]?.current,
  };
}
