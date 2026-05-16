export type GradePreset = 'neutral' | 'morning' | 'noon' | 'sunset' | 'night' | 'rain' | 'snow' | 'storm';
export type ColorGradeProps = {
    /**
     * If set, forces a fixed preset. When omitted, the preset is auto-selected
     * from current time-of-day + weather every render.
     */
    preset?: GradePreset;
    /** Master strength scalar (0..1) applied on top of the preset. */
    intensity?: number;
    /** Disable the vignette ring even when the preset would add it. */
    vignette?: boolean;
};
/**
 * Cinematic color grading + tone mapping pass for the world.
 *
 * Returns a fragment of postprocessing effects intended to be passed via the
 * `extraEffects` prop on `<ToonOutlines>`, or rendered inside an
 * `<EffectComposer>` you own. Doing it that way avoids stacking composers,
 * which would double-cost MSAA + render targets.
 */
export declare function ColorGrade({ preset, intensity, vignette, }?: ColorGradeProps): import("react").JSX.Element;
export default ColorGrade;
