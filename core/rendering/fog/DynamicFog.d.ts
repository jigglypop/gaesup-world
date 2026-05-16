import * as THREE from 'three';
export type DynamicFogProps = {
    /** Base fog color (sunny noon). */
    color?: THREE.ColorRepresentation;
    /** Base near distance (sunny noon). */
    near?: number;
    /** Base far distance (sunny noon). */
    far?: number;
    /** Disable to fall back to whatever fog is on the scene already. */
    enabled?: boolean;
};
/**
 * Drives `scene.fog` based on the current game time + weather.
 *
 * - Night/dawn/day/dusk shift the base color and pull fog closer at night.
 * - Rain/storm/snow override the color and tighten the falloff so the world
 *   feels denser during bad weather.
 *
 * Mount once anywhere inside the R3F Canvas; it has no children.
 */
export declare function DynamicFog({ color, near, far, enabled, }?: DynamicFogProps): null;
export default DynamicFog;
