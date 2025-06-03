import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useBridgeConnector } from '../hooks/useBridgeConnector';
import { AnimationAtomType } from '../types';
import { playActionsType, subscribeActionsType } from './type';

export function subscribeActions({ type }: subscribeActionsType) {
  const { rawData } = useBridgeConnector();
  const isSubscribed = useRef(false);

  useEffect(() => {
    const states = rawData.worldContext?.states;
    const control = rawData.inputSystem?.keyboard;
    const dispatch = rawData.worldDispatch;
    const animationState = rawData.worldContext?.animationState;

    if (!states || !control || !dispatch || !animationState?.[type] || isSubscribed.current) return;

    const animations: AnimationAtomType[] = [
      {
        tag: 'walk',
        condition: () => !states.isRunning && states.isMoving,
        action: () => {},
        animationName: 'walk',
        key: 'walk',
      },
      {
        tag: 'run',
        condition: () => states.isRunning,
        action: () => {},
        animationName: 'run',
        key: 'run',
      },
      {
        tag: 'jump',
        condition: () => states.isJumping,
        action: () => {},
        animationName: 'jump',
        key: 'jump',
      },
      {
        tag: 'ride',
        condition: () => control.keyR,
        action: () => {},
        animationName: 'ride',
        key: 'ride',
      },
      {
        tag: 'land',
        condition: () => states.isLanding,
        action: () => {},
        animationName: 'land',
        key: 'land',
      },
      {
        tag: 'fall',
        condition: () => states.isFalling,
        action: () => {},
        animationName: 'fall',
        key: 'fall',
      },
    ];

    const newStore: Record<string, AnimationAtomType> = {};
    animations.forEach((anim) => {
      newStore[anim.tag] = anim;
    });

    dispatch({
      type: 'update',
      payload: {
        animationState: {
          ...animationState,
          [type]: {
            ...animationState[type],
            store: newStore,
          },
        },
      },
    });

    isSubscribed.current = true;
  }, [type]);
}

export default function playActions({
  type,
  actions,
  animationRef,
  currentAnimation,
  isActive,
}: playActionsType) {
  const { rawData } = useBridgeConnector();
  const lastAnimationRef = useRef<string>('');

  const animationState = rawData.worldContext?.animationState;
  const dispatch = rawData.worldDispatch;
  const block = rawData.block;
  const mode = rawData.worldContext?.mode;

  const store = useMemo(() => {
    return animationState?.[type]?.store || {};
  }, [animationState, type]);

  const notify = useCallback(() => {
    const defaultAnimation = animationState?.[type]?.default || 'idle';
    let tag = defaultAnimation;

    for (const key in store) {
      const animation = store[key];
      if (animation?.condition && animation.condition()) {
        tag = animation.animationName || key;
        break;
      }
    }

    return tag;
  }, [store, animationState, type]);

  if (isActive && animationState?.[type]) {
    currentAnimation = animationState[type].current;
  }

  const play = useCallback(
    (tag: string) => {
      if (!animationState?.[type] || !dispatch) return;

      const currentTypeState = animationState[type];
      if (currentTypeState && currentTypeState.current !== tag) {
        const currentAnimationAction = store[tag];

        if (currentAnimationAction?.action) {
          currentAnimationAction.action();
        }

        dispatch({
          type: 'update',
          payload: {
            animationState: {
              ...animationState,
              [type]: {
                ...currentTypeState,
                current: tag,
              },
            },
          },
        });
      }
    },
    [animationState, dispatch, type, store],
  );

  useEffect(() => {
    if (!animationState?.[type] || !block || !mode || !actions) return;

    let animation = 'idle';
    if (block.animation) {
      animation = 'idle';
    } else if (currentAnimation) {
      animation = currentAnimation;
    } else if (animationState[type]?.current) {
      animation = animationState[type].current;
    }

    const action = actions[animation];
    if (action) {
      action.reset().fadeIn(0.2).play();
      return () => {
        action.fadeOut(0.2);
      };
    }
  }, [currentAnimation, mode?.type, block?.animation, type, animationState, actions]);

  useFrame(() => {
    if (isActive && animationState?.[type]) {
      const tag = notify();
      if (tag && tag !== lastAnimationRef.current) {
        lastAnimationRef.current = tag;
        play(tag);
      }
    }
  });

  return {
    animationRef,
    currentAnimation: animationState?.[type]?.current,
  };
}
