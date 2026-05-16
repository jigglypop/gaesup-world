import * as THREE from 'three';
export type LutOverlayProps = {
    /** Public URL to a `.cube` file (Adobe Cube LUT 1D or 3D). */
    url: string;
    /** Use higher-quality tetrahedral interpolation when true. */
    tetrahedralInterpolation?: boolean;
    /**
     * Numeric blend function id passed straight to the underlying
     * `LUT3DEffect`. Defaults to the effect's own default (NORMAL) when
     * omitted, which avoids forcing a hard dependency on the
     * `postprocessing` package at our import sites.
     */
    blendFunction?: number;
    /** Called once the LUT is parsed and uploaded as a 3D texture. */
    onLoad?: (texture: THREE.Data3DTexture) => void;
    /** Called if loading fails. */
    onError?: (error: Error) => void;
};
/**
 * Renders an Adobe `.cube` LUT as a postprocessing pass.
 *
 * Mount inside the same `<EffectComposer>` (or `extraEffects` slot) as
 * `<ColorGrade />` to apply a cinematic look. Returns `null` until the
 * LUT finishes loading; failure is silent (logged) so the rest of the
 * composer keeps rendering.
 */
export declare function LutOverlay({ url, tetrahedralInterpolation, blendFunction, onLoad, onError, }: LutOverlayProps): import("react").JSX.Element | null;
export default LutOverlay;
