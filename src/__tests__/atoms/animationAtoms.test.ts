import { createStore } from 'jotai';
import {
  animationAtoms,
  getAnimationAtom,
  createCurrentAnimationAtom,
  createAnimationStoreAtom,
  createAnimationSubscriptionAtom,
} from '@/gaesup/atoms/animationAtoms';
import { AnimationAtomType } from '@/gaesup/types';

describe('animationAtoms', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should have default animation states for each type', () => {
    const charAnim = store.get(animationAtoms.character);
    expect(charAnim.current).toBe('idle');
    expect(charAnim.default).toBe('idle');
    expect(Object.keys(charAnim.store).length).toBe(0);

    const vehicleAnim = store.get(animationAtoms.vehicle);
    expect(vehicleAnim.current).toBe('idle');
  });

  describe('getAnimationAtom', () => {
    it('should return the correct atom for a given type', () => {
      const charAtom = getAnimationAtom('character');
      expect(charAtom).toBe(animationAtoms.character);
    });
  });

  describe('createCurrentAnimationAtom', () => {
    it('should read and write the current animation', () => {
      const currentCharAnimAtom = createCurrentAnimationAtom('character');
      expect(store.get(currentCharAnimAtom)).toBe('idle');
      store.set(currentCharAnimAtom, 'walk');
      expect(store.get(currentCharAnimAtom)).toBe('walk');
      // Ensure the original atom is updated
      expect(store.get(animationAtoms.character).current).toBe('walk');
    });
  });

  describe('createAnimationStoreAtom', () => {
    it('should read and write the animation store', () => {
      const charStoreAtom = createAnimationStoreAtom('character');
      const newStore: Record<string, AnimationAtomType> = {
        jump: { tag: 'jump', condition: () => true },
      };
      expect(Object.keys(store.get(charStoreAtom)).length).toBe(0);
      store.set(charStoreAtom, newStore);
      expect(store.get(charStoreAtom).jump.tag).toBe('jump');
    });
  });

  describe('createAnimationSubscriptionAtom', () => {
    it('should subscribe a new animation', () => {
      const charSubscriptionAtom = createAnimationSubscriptionAtom('character');
      const walkAnimation: AnimationAtomType = { tag: 'walk', condition: () => true };

      store.set(charSubscriptionAtom, {
        type: 'subscribe',
        tag: 'walk',
        animation: walkAnimation,
      });

      const charStore = store.get(animationAtoms.character).store;
      expect(charStore.walk).toBe(walkAnimation);
    });

    it('should not resubscribe if animation is the same', () => {
      const charSubscriptionAtom = createAnimationSubscriptionAtom('character');
      const walkAnimation: AnimationAtomType = {
        tag: 'walk',
        condition: () => true,
        animationName: 'walk_anim',
      };

      // Subscribe once
      store.set(charSubscriptionAtom, { type: 'subscribe', tag: 'walk', animation: walkAnimation });
      const originalStore = store.get(animationAtoms.character).store;

      // Try to subscribe again with the same animation
      store.set(charSubscriptionAtom, { type: 'subscribe', tag: 'walk', animation: walkAnimation });
      const newStore = store.get(animationAtoms.character).store;

      // The store object should be the same, indicating no update was made.
      expect(newStore).toBe(originalStore);
    });

    it('should unsubscribe an animation', () => {
      const charSubscriptionAtom = createAnimationSubscriptionAtom('character');
      const walkAnimation: AnimationAtomType = { tag: 'walk', condition: () => true };
      store.set(charSubscriptionAtom, { type: 'subscribe', tag: 'walk', animation: walkAnimation });

      expect(store.get(animationAtoms.character).store.walk).toBeDefined();

      store.set(charSubscriptionAtom, { type: 'unsubscribe', tag: 'walk' });

      expect(store.get(animationAtoms.character).store.walk).toBeUndefined();
    });
  });
});
