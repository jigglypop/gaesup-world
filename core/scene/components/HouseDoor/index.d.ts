import type { SceneEntry, SceneId } from '../../types';
export type HouseDoorProps = {
    /** World position of the door pad. */
    position: [number, number, number];
    /** Scene id to enter when the player walks onto the pad. */
    sceneId: SceneId;
    /** Where to spawn the player inside the target scene. */
    entry: SceneEntry;
    /**
     * Where to spawn the player when they leave through the same door (defaults
     * to `position` shifted slightly outward).
     */
    exitOverride?: SceneEntry;
    /** Trigger radius in metres; default 1.4. */
    radius?: number;
    /** Cooldown in ms after a transition before it can re-trigger. */
    cooldownMs?: number;
    /** Visual color of the door pad. */
    color?: string;
    /** Optional label shown via gpEventBus toast (kept simple — no UI here). */
    label?: string;
};
/**
 * A volumetric trigger that swaps scenes when the player enters its radius.
 *
 * Implementation note: we do not rely on Rapier sensors here because the
 * outdoor scene is unmounted when entering an interior, which would tear down
 * a sensor mid-event. Polling the player's position with a small radius is
 * cheap and survives scene swaps.
 */
export declare function HouseDoor({ position, sceneId, entry, exitOverride, radius, cooldownMs, color, label, }: HouseDoorProps): import("react").JSX.Element;
