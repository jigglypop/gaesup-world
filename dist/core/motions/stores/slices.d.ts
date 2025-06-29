import { StateCreator } from 'zustand';
import { StoreState } from '../../stores/types';
import { MotionSliceState, MotionActions } from './types';
export declare const createMotionSlice: StateCreator<StoreState, [
], [
], MotionSliceState & MotionActions>;
