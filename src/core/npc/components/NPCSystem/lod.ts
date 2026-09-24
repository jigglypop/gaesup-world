import { weightFromDistance } from '@core/utils/sfe';

const NPC_LOD_NEAR = 30;
const NPC_LOD_FAR = 120;
const NPC_LOD_STRENGTH = 4;
const NPC_LOD_HYSTERESIS = 15;

/** Far NPCs stream out; a visible NPC stays mounted until it is clearly past the far ring, so boundary walkers do not remount. */
export function isNPCInLodRange(distance: number, wasVisible: boolean): boolean {
  if (wasVisible) return distance <= NPC_LOD_FAR + NPC_LOD_HYSTERESIS;
  return weightFromDistance(distance, NPC_LOD_NEAR, NPC_LOD_FAR, NPC_LOD_STRENGTH) > 0.01;
}
