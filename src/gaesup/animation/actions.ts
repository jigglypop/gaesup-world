import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Ref, useContext, useEffect } from "react";
import { Object3D, Object3DEventMap } from "three";
import { animationTagType, groundRayType } from "../controller/type";
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

export function usePlayActions() {
  const { characterGltf, vehicleGltf, airplaneGltf, animations } =
    useContext(GaesupWorldContext);
  const { animations: characterAnimations } = characterGltf;
  const characterResult = useAnimations(characterAnimations);

  const { animations: vehicleAnimations } = vehicleGltf;
  const vehicleResult = useAnimations(vehicleAnimations);

  const { animations: airplaneAnimations } = airplaneGltf;
  const airplaneResult = useAnimations(airplaneAnimations);

  const dispatch = useContext(GaesupWorldDispatchContext);
  const play = (tag: keyof animationTagType) => {
    animations.current = tag;
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
  };

  const setAnimationName = (actions: actionsType) => {
    animations.animationNames = Object.assign(
      animations.animationNames,
      Object.keys(actions).reduce((acc, cur) => {
        return {
          ...acc,
          [cur]: cur,
        };
      }, {})
    );
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...animations,
        },
      },
    });
  };

  const resultRef: {
    character: playResultType;
    vehicle: playResultType;
    airplane: playResultType;
  } = {
    character: characterResult,
    vehicle: vehicleResult,
    airplane: airplaneResult,
  };
  return { resultRef, play, setAnimationName };
}

export default function playCharacterActions({ groundRay }: playActionsType) {
  const {
    resultRef: {
      character: { actions, ref },
    },
    play,
    setAnimationName,
  } = usePlayActions();
  const { states, activeState, animations, mode } =
    useContext(GaesupWorldContext);
  const {
    isNotMoving,
    isMoving,
    isJumping,
    isRunning,
    isAnimationOuter,
    isOnTheGround,
  } = states;
  const dispatch = useContext(GaesupWorldDispatchContext);
  const control = useKeyboardControls()[1]();

  const resetAni = () => play("idle");
  const playIdle = () => play("idle");
  const playWalk = () => play("walk");
  const playRun = () => play("run");
  const playJump = () => play("jump");
  const playFall = () => play("fall");
  const playRide = () => play("ride");
  const playLanding = () => play("land");

  useEffect(() => {
    return () => {
      resetAni();
    };
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
    if (mode.type === "character") {
      const action = actions[animations.current]?.reset().fadeIn(0.2).play();
      setAnimationName(actions);
      return () => {
        action?.fadeOut(0.2);
      };
    }
  }, [animations.current, mode.type]);

  useFrame(() => {
    if (mode.type === "character") {
      if (!isAnimationOuter) {
        if (isJumping) {
          playJump();
        } else if (isNotMoving) {
          playIdle();
        } else if (isRunning) {
          playRun();
        } else if (isMoving) {
          playWalk();
        }
        // if (groundRay.hit) {
        //   if (!isJumping && !isOnTheGround) {
        //     if (groundRay.hit.toi < 5) {
        //       playLanding();
        //     } else {
        //       playFall();
        //     }
        //   }
        // }
        // if (groundRay.hit === null && activeState.velocity.y < 0) {
        //   playFall();
        // }
      }
    }
  });
  return {
    ref,
  };
}
