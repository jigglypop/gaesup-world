import { atom, WritableAtom } from 'jotai';
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

export function getAnimationAtom(
  type: 'character' | 'vehicle' | 'airplane'
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

export const createCurrentAnimationAtom = (
  type: 'character' | 'vehicle' | 'airplane'
) => atom(
  (get) => get(getAnimationAtom(type)).current,
  (get, set, newCurrent: string) => {
    const currentState = get(getAnimationAtom(type));
    set(getAnimationAtom(type), {
      ...currentState,
      current: newCurrent,
    });
  }
);

export const createAnimationStoreAtom = (
  type: 'character' | 'vehicle' | 'airplane'
) => atom(
  (get) => get(getAnimationAtom(type)).store,
  (get, set, newStore: { [key: string]: AnimationAtomType }) => {
    const currentState = get(getAnimationAtom(type));
    set(getAnimationAtom(type), {
      ...currentState,
      store: newStore,
    });
  }
);


export const createAnimationSubscriptionAtom = (
  type: 'character' | 'vehicle' | 'airplane'
) => atom(
  null,
  (get, set, action: { type: 'subscribe' | 'unsubscribe'; tag: string; animation?: AnimationAtomType }) => {
    const currentState = get(getAnimationAtom(type));
    const newStore = { ...currentState.store };
    if (action.type === 'subscribe' && action.animation) {
      const existing = newStore[action.tag];
      if (existing?.tag === action.animation.tag && 
          existing?.animationName === action.animation.animationName) {
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
  }
); 