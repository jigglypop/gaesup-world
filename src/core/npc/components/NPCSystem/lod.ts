import { weightFromDistance } from '@core/utils/sfe';

const NPC_LOD_NEAR = 30;
const NPC_LOD_FAR = 120;
const NPC_LOD_STRENGTH = 4;
const NPC_LOD_HYSTERESIS = 15;
/** A mounted NPC keeps its place under the visible cap until another is this many meters nearer. */
const NPC_CAP_HYSTERESIS = 5;

/** Beyond this camera distance an NPC's animation advances at a lower rate. */
export const NPC_ANIMATION_FAR = NPC_LOD_NEAR;

/** Far NPCs stream out; a visible NPC stays mounted until it is clearly past the far ring, so boundary walkers do not remount. */
export function isNPCInLodRange(distance: number, wasVisible: boolean): boolean {
  if (wasVisible) return distance <= NPC_LOD_FAR + NPC_LOD_HYSTERESIS;
  return weightFromDistance(distance, NPC_LOD_NEAR, NPC_LOD_FAR, NPC_LOD_STRENGTH) > 0.01;
}

/**
 * The NPCs to mount, by camera distance: those in LOD range, nearest first and at most `maxVisible`. Mounted NPCs
 * count as a few meters nearer, so two walkers at the edge of the cap do not swap back and forth.
 */
export function selectVisibleNPCs(distances: ReadonlyMap<string, number>, visible: ReadonlySet<string>, maxVisible = Infinity): Set<string> {
  const ranked: [string, number][] = [];
  for (const [id, distance] of distances) {
    const shown = visible.has(id);
    if (isNPCInLodRange(distance, shown)) ranked.push([id, shown ? distance - NPC_CAP_HYSTERESIS : distance]);
  }
  if (ranked.length > maxVisible) ranked.sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
  return new Set(ranked.slice(0, Math.max(0, maxVisible)).map(([id]) => id));
}
