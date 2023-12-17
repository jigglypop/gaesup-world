import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { animationTagType, groundRayType } from "../controller/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context";

export type playActionsType = {
  groundRay: groundRayType;
  isRider?: boolean;
};

export default function playActions({ groundRay, isRider }: playActionsType) {
  const { characterGltf, animations: characterAnimations } =
    useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { animations } = characterGltf;
  const control = useKeyboardControls()[1]();
  const { actions, ref: animationRef } = useAnimations(animations);

  useEffect(() => {
    characterAnimations.keyControl = control;
    dispatch({
      type: "update",
      payload: {
        animations: {
          ...characterAnimations,
        },
      },
    });
  }, [control]);

  const play = (tag: keyof animationTagType) => {
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

  const setAnimationName = (actions: {
    [x: string]: THREE.AnimationAction | null;
  }) => {
    characterAnimations.animationNames = Object.assign(
      characterAnimations.animationNames,
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
          ...characterAnimations,
        },
      },
    });
  };

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
    const action = actions[characterAnimations.current]
      ?.reset()
      .fadeIn(0.2)
      .play();
    setAnimationName(actions);
    return () => {
      action?.fadeOut(0.2);
    };
  }, [characterAnimations.current]);

  const { states, activeState } = useContext(GaesupWorldContext);
  const {
    isNotMoving,
    isMoving,
    isJumping,
    isRunning,
    isAnimationOuter,
    isOnTheGround,
  } = states;
  useFrame(() => {
    if (isRider) {
      playRide();
    } else {
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
        if (groundRay.hit) {
          if (!isJumping && !isOnTheGround) {
            if (groundRay.hit.toi < 5) {
              playLanding();
            } else {
              playFall();
            }
          }
        }
        if (groundRay.hit === null && activeState.velocity.y < 0) {
          playFall();
        }
      }
    }
  });
  return {
    animationRef,
  };
}
