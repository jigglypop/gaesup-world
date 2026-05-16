export type SceneFaderProps = {
    zIndex?: number;
};
/**
 * Renders a full-screen DOM overlay that fades in/out during scene
 * transitions. Mount it once near the root of your HUD.
 */
export declare function SceneFader({ zIndex }?: SceneFaderProps): import("react").JSX.Element | null;
