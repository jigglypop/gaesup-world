import type { NavigationAgentSize, NavigationSystem } from '../../navigation/NavigationSystem';
import { createNPCNavigationRoute } from '../../navigation/NPCNavigationAdapter';
import type { NPCInstance } from '../types';

export type Point = [number, number, number];

/** How far, in grid cells, a route looks for free ground around a start or target inside an obstacle. */
const FREE_GROUND_RINGS = 3;

/** `point` when the agent may stand there, else the center of the nearest free cell within a few cells, if any. */
export function freeGround(navigation: NavigationSystem, point: Point, size: NavigationAgentSize): Point | undefined {
  if (navigation.isWalkable(point[0], point[2], size)) return point;
  const [cx, cz] = navigation.worldToGrid(point[0], point[2]);
  let best: Point | undefined;
  let bestDistance = Infinity;
  for (let ring = 1; ring <= FREE_GROUND_RINGS && !best; ring++) {
    for (let dz = -ring; dz <= ring; dz++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
        const [x, , z] = navigation.gridToWorld(cx + dx, cz + dz, point[1]);
        const distance = (x - point[0]) ** 2 + (z - point[2]) ** 2;
        if (distance < bestDistance && navigation.isWalkable(x, z, size)) {
          best = [x, point[1], z];
          bestDistance = distance;
        }
      }
    }
  }
  return best;
}

/**
 * The points an NPC at `position` walks toward `target`: the grid's route around walls once navigation is ready, the
 * straight segment before that. An NPC standing inside an obstacle's cells first steps out to free ground, and a target
 * inside one is reached at the nearest free ground; one the grid cannot reach at all gets no points.
 */
export function routeSteps(navigation: NavigationSystem | undefined, instance: NPCInstance, position: Point, target: Point): Point[] {
  if (!navigation?.isReady) return [[...target]];
  const size = instance.volume ? { agentRadius: instance.volume.radius * Math.max(instance.scale[0], instance.scale[2]) } : {};
  const from = freeGround(navigation, position, size);
  const to = freeGround(navigation, target, size);
  const path = from && to ? createNPCNavigationRoute(navigation, { id: instance.id, position: [...from], ...size }, to, { includeStart: true }) : [];
  const steps = path.slice(1).map(([x, y, z]): Point => [x, y, z]);
  const end = steps[steps.length - 1] ?? path[0];
  if (from && to && end) {
    if (Math.hypot(end[0] - to[0], end[2] - to[2]) > 1e-6) steps.push([...to]);
    if (from !== position) steps.unshift([...from]);
  }
  return steps;
}
