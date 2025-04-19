import { useFrame } from '@react-three/fiber';
import { useContext, useEffect, useMemo } from 'react';
import { AnimationTagType } from '../types';
import { useGaesupAnimation } from '../hooks/useGaesupAnimation';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import { playActionsType, subscribeActionsType } from './type';

// 공통 애니메이션 설정을 미리 메모이제이션
const DEFAULT_ANIMATION_ATOMS = [
  {
    tag: 'walk',
    condition: (states) => !states.isRunning && states.isMoving,
    action: () => {},
    animationName: 'walk',
    key: 'walk',
  },
  {
    tag: 'run',
    condition: (states) => states.isRunning,
    action: () => {},
    animationName: 'run',
    key: 'run',
  },
  {
    tag: 'jump',
    condition: (states) => states.isJumping,
    action: () => {},
    animationName: 'jump',
    key: 'jump',
  },
  {
    tag: 'ride',
    condition: (states) => states.isPush['keyR'],
    action: () => {},
    animationName: 'ride',
    key: 'ride',
  },
  {
    tag: 'land',
    condition: (states) => states.isLanding,
    action: () => {},
    animationName: 'land',
    key: 'land',
  },
  {
    tag: 'fall',
    condition: (states) => states.isFalling,
    action: () => {},
    animationName: 'fall',
    key: 'fall',
  },
];

export function subscribeActions({ type }: subscribeActionsType) {
  const worldContext = useContext(GaesupWorldContext);
  const { states } = worldContext;
  const { subscribeAll } = useGaesupAnimation({ type });

  // 초기 애니메이션 등록 (최적화)
  useEffect(() => {
    // 상태를 클로저로 바인딩하여 함수 생성 최적화
    const animationAtoms = DEFAULT_ANIMATION_ATOMS.map((atom) => ({
      ...atom,
      condition: () => atom.condition(states),
    }));

    subscribeAll(animationAtoms);
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

  // 현재 애니메이션 상태를 계산하는 함수 메모이제이션
  const getAnimationState = useMemo(() => {
    return () => {
      if (block.animation) {
        return 'idle';
      }
      if (currentAnimation) {
        return currentAnimation;
      }
      if (animationState[type]?.current) {
        return animationState[type].current;
      }
      return 'idle';
    };
  }, [block.animation, currentAnimation, animationState, type]);

  const play = (tag: keyof AnimationTagType) => {
    // 같은 애니메이션이 재생 중이면 중복 상태 업데이트 방지
    if (animationState[type].current === tag) {
      return;
    }

    animationState[type].current = tag;
    const currentAnimation = store[tag];
    if (currentAnimation?.action) {
      currentAnimation.action();
    }

    dispatch({
      type: 'update',
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
  };

  // 애니메이션 효과 처리 (최적화)
  useEffect(() => {
    const animation = getAnimationState();
    const action = actions[animation]?.reset().fadeIn(0.2).play();

    return () => {
      if (action) {
        action.fadeOut(0.2);
      }
    };
  }, [currentAnimation, mode.type, block.animation, type, actions, getAnimationState]);

  // 프레임 업데이트 빈도 최적화 (과도한 상태 변경 방지)
  useFrame(() => {
    if (isActive) {
      const tag = notify() as keyof AnimationTagType;
      if (tag && tag !== animationState[type].current) {
        play(tag);
      }
    }
  });

  return {
    animationRef,
    currentAnimation: animationState?.[type]?.current,
  };
}
