/**
 * How both water shaders read shore coverage (0 land, 0.5 on the shoreline, 1 open water; see `ShoreField`) and the
 * colors they share. The visible edge sits a little inside the water tiles, so their straight outline never shows.
 */
export const WATER_SHORE = {
  /** Coverage noise that bends the shoreline off the grid; below the edge band so a tile border stays transparent. */
  wobble: 0.08,
  /** Transparent below, bank above: where a pond begins. */
  edge: [0.6, 0.66],
  /** Dry bank darkening into wet sand. */
  wet: [0.62, 0.7],
  /** Wet sand giving way to water. */
  water: [0.68, 0.76],
  /** Foam rises at the waterline and thins out into the shallows. */
  foam: [0.68, 0.73, 0.77, 0.86],
  /** Shallow to deep water. */
  depth: [0.78, 1],
} as const;

export const WATER_COLORS = {
  bank: '#dccb98',
  wet: '#a8976b',
  shallow: '#63c3b7',
  deep: '#1c6b8e',
  foam: '#f3fbf6',
  /** What an unlit surface reflects at grazing angles. */
  sky: '#c3e6ee',
} as const;

/** Detailed water inside `enter` meters of the camera, simple past `exit`; in between it keeps its level. */
export const WATER_DETAIL_LOD = { enter: 40, exit: 52 } as const;

/** A surface's current level, written by the surface every few frames and read by its material before rendering. */
export type WaterLodState = { detailed: boolean };

/** Hysteresis keeps a surface on its level between the two thresholds, so it does not flicker there. */
export function selectWaterDetail(detailed: boolean, distance: number): boolean {
  return distance <= (detailed ? WATER_DETAIL_LOD.exit : WATER_DETAIL_LOD.enter);
}

/** Distance from a point to a level rectangle of water (half extents `halfWidth`, `halfDepth`), zero right above it. */
export function distanceToWater(
  x: number, y: number, z: number,
  centerX: number, centerY: number, centerZ: number,
  halfWidth: number, halfDepth: number,
): number {
  return Math.hypot(Math.max(0, Math.abs(x - centerX) - halfWidth), y - centerY, Math.max(0, Math.abs(z - centerZ) - halfDepth));
}
