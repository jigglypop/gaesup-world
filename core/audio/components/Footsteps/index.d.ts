export type SurfaceTag = 'grass' | 'sand' | 'snow' | 'wood' | 'stone' | 'water';
export type FootstepsProps = {
    /** Distance the player must travel between two consecutive step sounds. */
    strideMeters?: number;
    /** Cap on how many steps per second can be triggered, regardless of stride. */
    maxStepsPerSecond?: number;
    /** Per-surface volume multiplier (0..1). Defaults to 1. */
    volume?: number;
    /** Override the surface lookup. Most callers should leave this unset. */
    resolveSurface?: (x: number, z: number) => SurfaceTag;
    /** Disable the system without unmounting. */
    enabled?: boolean;
};
export declare function Footsteps({ strideMeters, maxStepsPerSecond, volume, resolveSurface, enabled, }?: FootstepsProps): null;
