export type SkyKeyframe = {
    /** Game hour (0-24, fractional ok). */
    hour: number;
    sunColor: string;
    ambientColor: string;
    sunIntensity: number;
    ambientIntensity: number;
    /** Sun azimuth in radians around Y. */
    azimuth: number;
    /** Sun elevation in radians (0 = horizon). */
    elevation: number;
};
export type DynamicSkyProps = {
    /** Distance from origin used to position the directional light. */
    rigDistance?: number;
    /** Cast shadows from the directional light. Defaults to true. */
    castShadow?: boolean;
    /** Shadow map resolution (square). Defaults to 1024. */
    shadowMapSize?: number;
    /** Override the default keyframes. */
    keyframes?: SkyKeyframe[];
    /** Damping factor for color/intensity easing (0..1). */
    damping?: number;
};
/**
 * Time + weather + season aware lighting rig.
 *
 * Owns a `directionalLight` (the sun) and an `ambientLight` whose color,
 * intensity, and orientation are interpolated each frame from a small
 * keyframe table. Weather scales intensity and tints toward overcast or
 * stormy palettes; seasons add a subtle warm/cool tint.
 *
 * Mount once inside the R3F scene, replacing manual `directionalLight`
 * + `ambientLight` setups.
 */
export declare function DynamicSky({ rigDistance, castShadow, shadowMapSize, keyframes, damping, }?: DynamicSkyProps): import("react").JSX.Element;
export default DynamicSky;
