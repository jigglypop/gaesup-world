import type { NPCObservation } from '../types';

type Point = [number, number, number];

/** FNV-1a over the id: a stable number per NPC, the same on every client. */
function hashId(id: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < id.length; index++) hash = Math.imul(hash ^ id.charCodeAt(index), 0x01000193);
  return hash >>> 0;
}

/** One mulberry32 step: a uniform number in [0, 1) from a 32-bit seed. */
function unit(seed: number): number {
  let value = (seed + 0x6d2b79f5) >>> 0;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

/** Where in its decision interval an NPC decides, so NPCs sharing an interval spread across ticks. */
export function npcDecisionPhase(id: string): number {
  return unit(hashId(id));
}

/**
 * A point within `radius` of the NPC's home (its position when it has none). Each NPC and decision time gets its own
 * point, and every client computes the same one from the same observation.
 */
export function createWanderTarget(observation: NPCObservation, radius: number): Point {
  const center = observation.home ?? observation.position;
  const seed = hashId(observation.instanceId) ^ Math.round(observation.timestamp * 1000);
  const angle = unit(seed) * Math.PI * 2;
  const distance = Math.max(0.5, radius) * (0.35 + unit(seed ^ 0x9e3779b9) * 0.65);
  return [center[0] + Math.cos(angle) * distance, center[1], center[2] + Math.sin(angle) * distance];
}
