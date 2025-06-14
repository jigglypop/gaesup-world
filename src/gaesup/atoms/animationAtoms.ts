import { atom } from 'jotai';
import { AnimationAtomType, AnimationStatePropType } from '../../types';

const defaultAnimationState = {
  current: 'idle',
  store: {},
  default: 'idle',
};

const createAnimationAtom = () =>
  atom<AnimationStatePropType>({
    ...defaultAnimationState,
  });

export const animationAtoms = {
  character: createAnimationAtom(),
  vehicle: createAnimationAtom(),
  airplane: createAnimationAtom(),
} as const;

export const getAnimationAtom = (type: 'character' | 'vehicle' | 'airplane') =>
  animationAtoms[type];

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
