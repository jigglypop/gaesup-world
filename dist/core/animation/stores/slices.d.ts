import { AnimationSlice } from './types';
export declare const createAnimationSlice: (set: any, get: any) => Omit<AnimationSlice, "getAnimation" | "getCurrentAnimation">;
