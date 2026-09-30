import * as THREE from 'three';

import { AnimationType } from '../../core/types';
import { createAnimationSlice } from '../slices';
import { AnimationSlice } from '../types';

type SliceCreatorArgs = Parameters<typeof createAnimationSlice>;
type SetState = SliceCreatorArgs[0];
type GetState = SliceCreatorArgs[1];
type SliceState = ReturnType<GetState>;

const createPreviousState = (): SliceState => ({
  animationState: {
    character: { current: 'idle', default: 'idle', store: {} },
    vehicle: { current: 'idle', default: 'idle', store: {} },
    airplane: { current: 'idle', default: 'idle', store: {} },
  },
});

describe('createAnimationSlice', () => {
  let set: jest.MockedFunction<SetState>;
  let get: jest.MockedFunction<GetState>;
  let slice: Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>;

  const applyFirstUpdate = (previousState: SliceState): SliceState => {
    const updater = set.mock.calls[0]?.[0];
    if (typeof updater !== 'function') {
      throw new Error('Expected set to be called with an updater function');
    }
    return updater(previousState);
  };

  beforeEach(() => {
    set = jest.fn();
    get = jest.fn();
    slice = createAnimationSlice(set, get, {
      setState: set,
      getState: get,
      getInitialState: get,
      subscribe: jest.fn(),
    });
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
    const newState = applyFirstUpdate(createPreviousState());

    expect(set).toHaveBeenCalledTimes(1);
    expect(newState.animationState.character.current).toBe(newAnimation);
  });

  it('resetAnimations should call set to restore initial state', () => {
    slice.resetAnimations();
    const previousState = createPreviousState();
    previousState.animationState.character.current = 'run';
    previousState.animationState.vehicle.current = 'drive';
    const newState = applyFirstUpdate(previousState);

    expect(set).toHaveBeenCalledTimes(1);
    expect(newState.animationState.character.current).toBe('idle');
    expect(newState.animationState.vehicle.current).toBe('idle');
  });

  it('setAnimationAction should call set with the new action in the store', () => {
    const type: AnimationType = 'vehicle';
    const animationName = 'drive';
    const mockAction = {} as THREE.AnimationAction;

    slice.setAnimationAction(type, animationName, mockAction);

    const newState = applyFirstUpdate(createPreviousState());

    expect(set).toHaveBeenCalledTimes(1);
    expect(newState.animationState.vehicle.store[animationName]).toBe(mockAction);
  });
});
