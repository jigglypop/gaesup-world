import type { AnimationAction } from 'three';
type AnimationActions = Record<string, AnimationAction | null | undefined>;
export declare function useAnimationPlayer(active: boolean): void;
export declare function createAnimationController(actions: AnimationActions): {
    playAnimation: (tag: string, fadeTime?: number) => void;
    stopAnimation: (tag: string, fadeTime?: number) => void;
    crossFade: (from: string, to: string, fadeTime?: number) => void;
};
export {};
