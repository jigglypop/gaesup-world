import { StateCreator } from 'zustand';
import { InteractionSliceState, InteractionActions } from './types';
type Slice = InteractionSliceState & InteractionActions;
export declare const createInteractionSlice: StateCreator<Slice, [], [], Slice>;
export {};
