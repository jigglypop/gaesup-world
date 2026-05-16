import type { AnimationAction } from 'three';
import { ModeType } from '@stores/slices';
export declare function useAnimationSetup(actions: Record<string, AnimationAction | null> | undefined, modeType: ModeType, isActive: boolean): void;
