import { StateCreator } from 'zustand';
import { AnimationSlice } from './types';
import { EntityAnimationStates } from '../core/types';
type SliceState = {
    animationState: EntityAnimationStates;
};
export declare const createAnimationSlice: StateCreator<SliceState, [
], [
], Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>>;
export {};
