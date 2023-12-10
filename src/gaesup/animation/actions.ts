import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RefObject, useContext, useEffect } from "react";
import { animationTagType, groundRayType } from "../controller/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../stores/context/gaesupworld";

export type playActionsType = {
  outerGroupRef: RefObject<THREE.Group>;
  groundRay: groundRayType;
  isRider?: boolean;
};

export default function playActions({
  outerGroupRef,
  groundRay,
  isRider,
}: playActionsType) {
  const { characterGltf, animations: characterAnimations } =
    useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { animations } = characterGltf;
  const control = useKeyboardControls()[1]();
  const { actions } = useAnimations(animations, outerGroupRef);

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

  const resetAni = () => playAnimation("idle");
  const playIdle = () => playAnimation("idle");
  const playWalk = () => playAnimation("walk");
  const playRun = () => playAnimation("run");
  const playJump = () => playAnimation("jump");
  const playFall = () => playAnimation("fall");
  const playRide = () => playAnimation("ride");

  useEffect(() => {
    return () => {
      resetAni();
    };
  }, []);

  useEffect(() => {
    // Play animation
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
  const { isNotMoving, isMoving, isJumping, isRunning, isAnimationOuter } =
    states;
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
        if (groundRay.hit === null && activeState.velocity.y < 0) {
          playFall();
        }
      }
    }
  });
}
