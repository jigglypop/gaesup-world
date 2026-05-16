import * as THREE from 'three';
export type FootprintsProps = {
    /** Maximum number of footprints kept on screen at once. */
    capacity?: number;
    /** Distance (m) the player must travel before a new footprint is laid. */
    step?: number;
    /** Lifetime in seconds before a footprint is fully faded out. */
    lifetime?: number;
    /** Footprint quad size (m). */
    size?: number;
    /** Y offset above ground (m). Avoids z-fighting on flat tiles. */
    y?: number;
    /** Color of the footprint shadow. */
    color?: THREE.ColorRepresentation;
};
/**
 * Lightweight footprint trail. Drops a small dark quad at the player's
 * position whenever they have walked a configurable distance, fades it out
 * over `lifetime`, and recycles the slot when capacity is exceeded.
 *
 * Single instanced mesh + per-instance color for fade => O(1) cost regardless
 * of how long the player has been walking.
 */
export declare function Footprints({ capacity, step, lifetime, size, y, color, }?: FootprintsProps): import("react").JSX.Element;
export default Footprints;
