/**
 * Single shared `useFrame` driver for every grass tile in the scene.
 *
 * Mount one instance inside the world canvas (typically next to other
 * scenery components). The driver collects camera + frustum once per
 * frame and asks the grass manager to update all registered tiles in
 * a single batch — replacing N independent `useFrame` callbacks with
 * a single one regardless of how many grass tiles are placed.
 */
export declare function GrassDriver(): null;
export default GrassDriver;
