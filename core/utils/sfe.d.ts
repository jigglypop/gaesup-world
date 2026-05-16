export declare const clamp: (value: number, min: number, max: number) => number;
export declare const clamp01: (value: number) => number;
/**
 * SFE-style suppression helper.
 *
 * We treat sigma as a normalized "cost" and compute w = exp(-sigma).
 * This file stays pure (no THREE / no side effects) for easy unit testing.
 */
export declare const sigmaFromDistance: (distance: number, near: number, far: number, strength?: number) => number;
export declare const weightFromSigma: (sigma: number) => number;
/**
 * Returns a suppression weight w in [0, 1].
 * Uses a hard cutoff at far to guarantee w=0 for extreme throttling.
 */
export declare const weightFromDistance: (distance: number, near: number, far: number, strength?: number) => number;
export type SuppressionFactors = {
    distance: number;
    near: number;
    far: number;
    /** View angle from camera forward (radians, 0 = center of view). */
    viewAngle?: number;
    /** Rate of change (velocity magnitude). */
    velocity?: number;
    /** Screen coverage fraction [0,1]. */
    coverage?: number;
};
export type SuppressionConfig = {
    distanceStrength: number;
    angleStrength: number;
    velocityStrength: number;
    coverageStrength: number;
    /** Half-FOV in radians beyond which angle suppression maxes out. */
    maxAngle: number;
    /** Velocity below which velocity suppression is zero. */
    velocityThreshold: number;
};
/**
 * Multi-dimensional suppression weight.
 *
 * Combines distance, view angle, velocity, and screen coverage
 * into a single w = exp(-sigma_total) weight for unified LOD control.
 */
export declare const multiSigma: (factors: SuppressionFactors, config?: Partial<SuppressionConfig>) => number;
export declare class RenderBudget {
    private targetFps;
    private eta;
    private currentStrength;
    private minStrength;
    private maxStrength;
    private frameTimeHistory;
    private historySize;
    constructor(options?: {
        targetFps?: number;
        eta?: number;
        initialStrength?: number;
        minStrength?: number;
        maxStrength?: number;
        historySize?: number;
    });
    /**
     * Call every frame with the frame's delta time (seconds).
     * Returns the updated suppression strength to use for LOD calculations.
     */
    update(deltaTime: number): number;
    get strength(): number;
    get averageFps(): number;
    reset(): void;
}
