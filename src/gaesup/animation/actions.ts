import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Ref, useContext, useEffect } from "react";
import { Object3D, Object3DEventMap } from "three";
import { animationTagType, groundRayType } from "../controller/type";
import { useGaesupAnimation } from "../hooks/useGaesupAnimation";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context";

export type playActionsType = {
  groundRay: groundRayType;
};

export type actionsType = {
  [x: string]: THREE.AnimationAction | null;
};

export type playResultType = {
  actions: actionsType;
  ref: Ref<Object3D<Object3DEventMap>>;
};

// 캐릭터 등록, 애니메이션 이름 설정, 애니메이션 실행

export function readyAnimation() {
  const { characterGltf, vehicleGltf, airplaneGltf } =
    useContext(GaesupWorldContext);
  const resultRef: {
    character: playResultType;
    vehicle: playResultType;
    airplane: playResultType;
  } = {
    character: null,
    vehicle: null,
    airplane: null,
  };
  if (characterGltf && characterGltf.animations)
    resultRef.character = useAnimations(characterGltf.animations);
  if (vehicleGltf && vehicleGltf.animations)
    resultRef.vehicle = useAnimations(vehicleGltf.animations);
  if (airplaneGltf && airplaneGltf.animations)
    resultRef.airplane = useAnimations(airplaneGltf.animations);

  return {
    resultRef,
  };
}

export default function playCharacterActions({ groundRay }: playActionsType) {
  const {
    states,
    activeState,
    animations,
    mode,
    characterGltf,
    vehicleGltf,
    airplaneGltf,
  } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const control = useKeyboardControls()[1]();
  const { subscribeAll, notify, store } = useGaesupAnimation();
  const resultRef: {
    character: playResultType;
    vehicle: playResultType;
    airplane: playResultType;
  } = {
    character: null,
    vehicle: null,
    airplane: null,
  };
  if (characterGltf && characterGltf.animations)
    resultRef.character = useAnimations(characterGltf.animations);
  if (vehicleGltf && vehicleGltf.animations)
    resultRef.vehicle = useAnimations(vehicleGltf.animations);
  if (airplaneGltf && airplaneGltf.animations)
    resultRef.airplane = useAnimations(airplaneGltf.animations);

  const play = (tag: keyof animationTagType) => {
    animations.current = tag;
    const currentAnimation = store[tag];
    if (currentAnimation?.action) {
      currentAnimation.action();
    }
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
  };

  const { actions, ref } = resultRef.character;

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

  useEffect(() => {
    animations.keyControl = control;
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
  }, [control]);

  useEffect(() => {
    const action = actions[animations.current]?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [animations.current, mode.type]);

  useFrame(() => {
    const tag = notify() as keyof animationTagType;
    play(tag);
  });

  return {
    ref,
    resultRef,
  };
}
