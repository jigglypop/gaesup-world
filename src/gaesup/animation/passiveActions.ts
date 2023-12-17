import { useAnimations } from "@react-three/drei";
import { useEffect } from "react";
import { AnimationClip } from "three";

export type playPassiveActionsType = {
  current: string;
  animations: AnimationClip[];
};

export default function playPassiveActions({
  current,
  animations,
}: playPassiveActionsType) {
  const { actions, ref: animationRef } = useAnimations(animations);

  useEffect(() => {
    const action = actions[current]?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [current]);

  return {
    animationRef,
  };
}
