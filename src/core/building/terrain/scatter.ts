import { ALL_NEIGHBORS, borderDistance, cellKey, hash2, neighborMask, smooth, valueNoise } from './grid';
import { getDefaultBuildingObject } from '../catalog/objects';
import { tileWorldSize } from '../model/footprint';
import type { MeshConfig, MeshScatterConfig, PlacedObject, TileConfig, TileGroupConfig } from '../types';

/** Placed objects keep scattered decoration this far away, so flowers do not grow through trunks and fences. */
const OBJECT_CLEARANCE = 1.2;
const DEFAULT_SCALE: readonly [number, number] = [0.8, 1.2];

const isBox = (tile: TileConfig) => (tile.shape ?? 'box') === 'box';

function sameDecor(a: PlacedObject, b: PlacedObject): boolean {
  return a.position.x === b.position.x && a.position.y === b.position.y && a.position.z === b.position.z
    && a.rotation === b.rotation && a.config?.modelId === b.config?.modelId && a.config?.modelScale === b.config?.modelScale;
}

/** Whether a point is within `OBJECT_CLEARANCE` of a placed object, on a 2 m bucket grid of their positions. */
function clearanceOf(objects: readonly PlacedObject[]): (x: number, z: number) => boolean {
  const buckets = new Map<string, PlacedObject[]>();
  const bucket = (x: number, z: number) => `${Math.floor(x / 2)}:${Math.floor(z / 2)}`;
  for (const object of objects) {
    const key = bucket(object.position.x, object.position.z);
    const list = buckets.get(key);
    if (list) list.push(object);
    else buckets.set(key, [object]);
  }
  return (x, z) => {
    for (let dz = -2; dz <= 2; dz += 2) {
      for (let dx = -2; dx <= 2; dx += 2) {
        for (const object of buckets.get(bucket(x + dx, z + dz)) ?? []) {
          if (Math.hypot(object.position.x - x, object.position.z - z) < OBJECT_CLEARANCE) return true;
        }
      }
    }
    return false;
  };
}

/**
 * The decoration the meshes scatter over their tiles (`MeshConfig.scatter`), as model objects. Candidates sit on a
 * jittered grid of the rule's density, keep to the band beside `near` tiles when it names a cover, gather in patches
 * by `clump` and stay clear of placed objects. Every client, and every rebuild, gets the same decoration; objects equal
 * to one in `previous` (by id) are that object, so a rebuild hands unchanged decoration on as it was.
 */
export function scatterDecor(
  tileGroups: Iterable<TileGroupConfig>,
  meshes: ReadonlyMap<string, MeshConfig>,
  objects: readonly PlacedObject[] = [],
  previous?: ReadonlyMap<string, PlacedObject>,
): PlacedObject[] {
  const tiles: { tile: TileConfig; rules: readonly MeshScatterConfig[] }[] = [];
  const covers = new Map<string, TileConfig['objectType']>();
  for (const group of tileGroups) {
    for (const tile of group.tiles) {
      if (!isBox(tile)) continue;
      if (tile.objectType && tile.objectType !== 'none') covers.set(cellKey(tile.position.x, tile.position.z), tile.objectType);
      else {
        const rules = meshes.get(tile.materialId ?? group.floorMeshId)?.scatter;
        if (rules?.length) tiles.push({ tile, rules });
      }
    }
  }
  if (!tiles.length) return [];
  const blocked = clearanceOf(objects);
  const decor: PlacedObject[] = [];
  for (const { tile, rules } of tiles) {
    const size = tileWorldSize(tile);
    const half = size / 2;
    rules.forEach((rule, ruleIndex) => {
      const seed = rule.seed ?? 0;
      const mask = rule.near ? neighborMask(tile.position.x, tile.position.z, size, (x, z) => covers.get(cellKey(x, z)) === rule.near) : 0;
      if (rule.near && mask === 0) return;
      const within = rule.within ?? 1.6;
      const margin = rule.margin ?? 0.3;
      const [low, high] = rule.scale ?? DEFAULT_SCALE;
      const steps = Math.max(1, Math.round(size * Math.sqrt(Math.max(rule.density, 0))));
      const cell = size / steps;
      for (let row = 0; row < steps; row++) {
        for (let column = 0; column < steps; column++) {
          const cx = tile.position.x - half + (column + 0.5) * cell;
          const cz = tile.position.z - half + (row + 0.5) * cell;
          const salt = seed * 7.31 + ruleIndex * 3.17;
          const x = cx + (hash2(cx * 1.31 + salt, cz * 0.71) - 0.5) * cell * 0.9;
          const z = cz + (hash2(cz * 1.13 - salt, cx * 0.57) - 0.5) * cell * 0.9;
          if (rule.near) {
            const distance = borderDistance(~mask & ALL_NEIGHBORS, x - tile.position.x, z - tile.position.z, size);
            if (distance < margin || distance > within) continue;
          }
          const clump = rule.clump ?? 0;
          const patch = smooth(0.3, 0.7, valueNoise(x * 0.3 + salt, z * 0.3 - salt));
          if (hash2(x * 2.07 - salt, z * 1.93) >= 1 - clump + clump * patch) continue;
          if (blocked(x, z)) continue;
          const pick = hash2(x * 0.93 + salt, z * 1.77 - salt);
          const item = getDefaultBuildingObject(rule.models[Math.floor(pick * rule.models.length)] ?? '');
          if (!item?.modelUrl) continue;
          const spin = hash2(z * 1.49 + salt, x * 2.31);
          const object: PlacedObject = {
            id: `scatter:${tile.id}:${ruleIndex}:${row}:${column}`,
            type: 'model',
            position: { x, y: tile.position.y, z },
            rotation: spin * Math.PI * 2,
            config: { modelId: item.id, modelUrl: item.modelUrl, modelScale: item.defaultScale * (low + (high - low) * hash2(x + salt, z - salt)) },
          };
          const old = previous?.get(object.id);
          decor.push(old && sameDecor(old, object) ? old : object);
        }
      }
    });
  }
  return decor;
}
