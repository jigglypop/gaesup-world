import { createAnimationSlice } from '../slices';
import { AnimationSlice } from '../types';
import { AnimationType, EntityAnimationStates } from '../../core/types';
import * as THREE from 'three';

describe('createAnimationSlice', () => {
  let set: jest.Mock;
  let get: jest.Mock;
  let slice: Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>;

  beforeEach(() => {
    set = jest.fn();
    get = jest.fn();
    slice = createAnimationSlice(set, get);
  });

  it('should have initial state', () => {
    expect(slice.animationState).toBeDefined();
    expect(slice.animationState.character.current).toBe('idle');
  });

  it('setAnimation should call set with the new animation', () => {
    const type: AnimationType = 'character';
    const newAnimation = 'walk';
    
    slice.setAnimation(type, newAnimation);

    // The first argument to `set` is a function that receives the current state
    const updater = set.mock.calls[0][0];
    const previousState = {
      animationState: {
        character: { current: 'idle', default: 'idle', store: {} },
        vehicle: { current: 'idle', default: 'idle', store: {} },
        airplane: { current: 'idle', default: 'idle', store: {} },
      }
    };
    
    const newState = updater(previousState);

    expect(set).toHaveBeenCalledTimes(1);
    expect(newState.animationState.character.current).toBe(newAnimation);
  });

  it('resetAnimations should call set to restore initial state', () => {
    slice.resetAnimations();
    const updater = set.mock.calls[0][0];
    const newState = updater({}); // Previous state doesn't matter for reset

    expect(set).toHaveBeenCalledTimes(1);
    expect(newState.animationState.character.current).toBe('idle');
    expect(newState.animationState.vehicle.current).toBe('idle');
  });

  it('setAnimationAction should call set with the new action in the store', () => {
    const type: AnimationType = 'vehicle';
    const animationName = 'drive';
    const mockAction = {} as THREE.AnimationAction;

    slice.setAnimationAction(type, animationName, mockAction);
    
    const updater = set.mock.calls[0][0];
    const previousState = {
      animationState: {
        character: { current: 'idle', default: 'idle', store: {} },
        vehicle: { current: 'idle', default: 'idle', store: {} },
        airplane: { current: 'idle', default: 'idle', store: {} },
      }
    };
    
    const newState = updater(previousState);

    expect(set).toHaveBeenCalledTimes(1);
    expect(newState.animationState.vehicle.store[animationName]).toBe(mockAction);
  });
}); 