import { useFrame } from '@react-three/fiber';
import { atom, WritableAtom } from 'jotai';
import { Ref, useCallback, useEffect, useMemo, useRef } from 'react';
import { AnimationAction, AnimationClip, Object3D, Object3DEventMap } from 'three';
import { groundRayType } from '../controller/type';
import { useBridgeConnector } from '../hooks/useBridgeConnector';
import { AnimationAtomType, AnimationStatePropType } from '../types';

const defaultAnimationState: AnimationStatePropType = {
  current: 'idle',
  store: {},
  default: 'idle',
};

export const characterAnimationAtom = atom<AnimationStatePropType>({
  ...defaultAnimationState,
});

export const vehicleAnimationAtom = atom<AnimationStatePropType>({
  ...defaultAnimationState,
});

export const airplaneAnimationAtom = atom<AnimationStatePropType>({
  ...defaultAnimationState,
});

const ANIMATION_CONFIGS: Omit<AnimationAtomType, 'condition'>[] = [
  { tag: 'walk', action: () => {}, animationName: 'walk', key: 'walk' },
  { tag: 'run', action: () => {}, animationName: 'run', key: 'run' },
  { tag: 'jump', action: () => {}, animationName: 'jump', key: 'jump' },
  { tag: 'ride', action: () => {}, animationName: 'ride', key: 'ride' },
  { tag: 'land', action: () => {}, animationName: 'land', key: 'land' },
  { tag: 'fall', action: () => {}, animationName: 'fall', key: 'fall' },
];

export function getAnimationAtom(
  type: 'character' | 'vehicle' | 'airplane',
): WritableAtom<AnimationStatePropType, [AnimationStatePropType], void> {
  switch (type) {
    case 'character':
      return characterAnimationAtom;
    case 'vehicle':
      return vehicleAnimationAtom;
    case 'airplane':
      return airplaneAnimationAtom;
    default:
      return characterAnimationAtom;
  }
}

export const createCurrentAnimationAtom = (type: 'character' | 'vehicle' | 'airplane') =>
  atom(
    (get) => get(getAnimationAtom(type)).current,
    (get, set, newCurrent: string) => {
      const currentState = get(getAnimationAtom(type));
      set(getAnimationAtom(type), {
        ...currentState,
        current: newCurrent,
      });
    },
  );

export const createAnimationStoreAtom = (type: 'character' | 'vehicle' | 'airplane') =>
  atom(
    (get) => get(getAnimationAtom(type)).store,
    (get, set, newStore: { [key: string]: AnimationAtomType }) => {
      const currentState = get(getAnimationAtom(type));
      set(getAnimationAtom(type), {
        ...currentState,
        store: newStore,
      });
    },
  );

export const createAnimationSubscriptionAtom = (type: 'character' | 'vehicle' | 'airplane') =>
  atom(
    null,
    (
      get,
      set,
      action: { type: 'subscribe' | 'unsubscribe'; tag: string; animation?: AnimationAtomType },
    ) => {
      const currentState = get(getAnimationAtom(type));
      const newStore = { ...currentState.store };
      if (action.type === 'subscribe' && action.animation) {
        const existing = newStore[action.tag];
        if (
          existing?.tag === action.animation.tag &&
          existing?.animationName === action.animation.animationName
        ) {
          return;
        }
        newStore[action.tag] = action.animation;
      } else if (action.type === 'unsubscribe') {
        delete newStore[action.tag];
      }
      set(getAnimationAtom(type), {
        ...currentState,
        store: newStore,
      });
    },
  );

export type playActionsType = {
  type: 'character' | 'vehicle' | 'airplane';
  currentAnimation?: string;
  actions: { [x: string]: AnimationAction | null };
  animationRef: Ref<Object3D<Object3DEventMap>>;
  isActive: boolean;
};

export type subscribeActionsType = {
  type: 'character' | 'vehicle' | 'airplane';
  groundRay: groundRayType;
  animations: AnimationClip[];
};

export function useSubscribeActions({ type }: subscribeActionsType) {
  const { rawData } = useBridgeConnector();
  const isSubscribed = useRef(false);

  useEffect(() => {
    const states = rawData.worldContext?.states;
    const control = rawData.inputSystem?.keyboard;
    const dispatch = rawData.worldDispatch;
    const animationState = rawData.worldContext?.animationState;

    if (!states || !control || !dispatch || !animationState?.[type] || isSubscribed.current) return;

    const newStore: Record<string, AnimationAtomType> = {};

    ANIMATION_CONFIGS.forEach((config) => {
      let condition: () => boolean;
      switch (config.tag) {
        case 'walk':
          condition = () => !states.isRunning && states.isMoving;
          break;
        case 'run':
          condition = () => states.isRunning;
          break;
        case 'jump':
          condition = () => states.isJumping;
          break;
        case 'ride':
          condition = () => control.keyR;
          break;
        case 'land':
          condition = () => states.isLanding;
          break;
        case 'fall':
          condition = () => states.isFalling;
          break;
        default:
          condition = () => false;
      }

      newStore[config.tag] = { ...config, condition };
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

export function usePlayActions({
  type,
  actions,
  animationRef,
  currentAnimation,
  isActive,
}: playActionsType) {
  const { rawData } = useBridgeConnector();
  const lastAnimationRef = useRef<string>('');
  const lastNotifyTimeRef = useRef(0);

  const animationState = rawData.worldContext?.animationState;
  const dispatch = rawData.worldDispatch;
  const block = rawData.block;
  const mode = rawData.worldContext?.mode;

  const store = useMemo(() => {
    return animationState?.[type]?.store || {};
  }, [animationState, type]);

  const notify = useCallback(() => {
    const now = performance.now();
    if (now - lastNotifyTimeRef.current < 16) {
      return lastAnimationRef.current;
    }
    lastNotifyTimeRef.current = now;

    const defaultAnimation = animationState?.[type]?.default || 'idle';
    let tag = defaultAnimation;

    const storeKeys = Object.keys(store);
    for (let i = 0; i < storeKeys.length; i++) {
      const key = storeKeys[i];
      if (!key) continue;
      const animation = store[key];
      if (animation?.condition?.()) {
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
