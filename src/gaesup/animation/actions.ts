import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { RefObject } from "react";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import usePlay from "../stores/animation";
import { currentAtom } from "../stores/current";
import { statesAtom } from "../stores/states";
import { groundRayType } from "../type";

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
  const { animations } = useGLTF("./gaesupyee.glb") as GLTF;

  const { playIdle, playWalk, playRun, playJump, playFall, playRide } = usePlay(
    {
      outerGroupRef,
      animations,
    }
  );
  const states = useAtomValue(statesAtom);
  const current = useAtomValue(currentAtom);
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
        if (groundRay.hit === null && current.velocity.y < 0) {
          playFall();
        }
      }
    }
  });
}
