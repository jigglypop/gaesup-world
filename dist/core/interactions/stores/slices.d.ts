import { StateCreator } from 'zustand';
import { StoreState } from '../../stores/types';
import { InteractionSliceState, InteractionActions } from './types';
export declare const createInteractionSlice: StateCreator<StoreState, [
], [
], InteractionSliceState & InteractionActions>;
