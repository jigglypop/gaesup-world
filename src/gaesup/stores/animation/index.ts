import { RefObject, useCallback, useEffect } from 'react';

import { actionsType, animationTagType } from '@gaesup/type';
import { useAnimations, useKeyboardControls } from '@react-three/drei';
import { atom, useAtom } from 'jotai';
import * as THREE from 'three';

export type animationPropType = {
  current: keyof animationTagType;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
};

export const animationAtom = atom<animationPropType>({
  current: 'idle',
  animationNames: {
    idle: 'idle',
    walk: 'walk',
    run: 'run',
    jump: 'jump',
    jumpIdle: 'jumpIdle',
    jumpLand: 'jumpLand',
    fall: 'fall'
  },
  keyControl: {}
});

animationAtom.debugLabel = 'animation';

export default function usePlay({
  outerGroupRef,
  animations
}: {
  outerGroupRef?: RefObject<THREE.Group>;
  animations: THREE.AnimationClip[];
}) {
  const [_, getKeys] = useKeyboardControls();
  const keys = getKeys();
  const { actions } = useAnimations(animations, outerGroupRef);
  const [animation, setAnimation] = useAtom(animationAtom);

  useEffect(() => {
    setAnimation((animation) => ({
      ...animation,
      keyControl: keys
    }));
  }, [keys]);
  // Animation set state
  const playAnimation = useCallback(
    (tag: keyof animationTagType) => {
      setAnimation((animation) => ({
        ...animation,
        current: tag
      }));
    },
    [setAnimation, animation, animation.current]
  );

  const setAnimationName = (actions: {
    [x: string]: THREE.AnimationAction | null;
  }) => {
    setAnimation((animation) => ({
      ...animation,
      animationNames: Object.assign(
        animation.animationNames,
        Object.keys(actions).reduce((acc, cur) => {
          return {
            ...acc,
            [cur]: cur
          };
        }, {})
      )
    }));
  };

  const resetAni = () => playAnimation('idle');
  const playIdle = () => playAnimation('idle');
  const playWalk = () => playAnimation('walk');
  const playRun = () => playAnimation('run');
  const playJump = () => playAnimation('jump');
  const playJumpIdle = () => playAnimation('jumpIdle');
  const playJumpLand = () => playAnimation('jumpLand');
  const playFall = () => playAnimation('fall');

  useEffect(() => {
    return () => {
      resetAni();
    };
  }, []);

  useEffect(() => {
    // Play animation
    const action = actions[animation.current]?.reset().fadeIn(0.2).play();
    setAnimationName(actions);
    return () => {
      action?.fadeOut(0.2);
    };
  }, [animation.current]);
  return {
    current: animation.current,
    setAnimation,
    playAnimation,
    resetAni,
    playIdle,
    playWalk,
    playRun,
    playJump,
    playJumpIdle,
    playJumpLand,
    playFall
  };
}
