import type { Position3D, WallConfig } from '../../types';
import { createBuildingStore } from '../buildingStore';
import type { BuildingSpatialIndex } from '../spatialIndex';

function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => (state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}

/** Every index entry in a stable order. */
function entries(index: BuildingSpatialIndex) {
  const sorted = <T,>(map: Map<string, T>) => [...map].sort(([a], [b]) => (a < b ? -1 : 1));
  const keys = (map: Map<string, number[]>) => sorted(map).map(([id, cells]) => [id, [...cells].sort((a, b) => a - b)]);
  return {
    tileMeta: sorted(index.tileMeta),
    tileCells: keys(index.tileCells),
    wallMeta: sorted(index.wallMeta),
    wallCells: keys(index.wallCells),
    placementCells: sorted(index.placementCells),
  };
}

test.each([3, 11, 29])('the spatial index matches one rebuilt from the saved data after random and rejected edits (seed %i)', (seed) => {
  const next = random(seed);
  const store = createBuildingStore();
  store.getState().initializeDefaults();
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!;
  // One edit in ten lands 1e17 m out, where the index cannot key cells, so the store rejects it by throwing.
  const position = (): Position3D => (next() < 0.1
    ? { x: 1e17, y: 0, z: 0 }
    : { x: Math.round((next() * 2 - 1) * 5) * 4, y: Math.floor(next() * 3), z: Math.round((next() * 2 - 1) * 5) * 4 });
  const wall = (groupId: string): WallConfig => ({
    id: `w${id++}`, wallGroupId: groupId, position: position(), rotation: { x: 0, y: Math.floor(next() * 4) * Math.PI / 2, z: 0 },
  });
  let id = 0;
  let rejected = 0;

  for (let step = 0; step < 250; step++) {
    const state = store.getState();
    const tileGroupIds = [...state.tileGroups.keys()];
    const wallGroupIds = [...state.wallGroups.keys()];
    const tiles = [...state.tileGroups.values()].flatMap((group) => group.tiles.map((tile) => ({ group: group.id, id: tile.id })));
    const walls = [...state.wallGroups.values()].flatMap((group) => group.walls.map((entry) => ({ group: group.id, id: entry.id })));
    const roll = next();
    try {
      if (roll < 0.15 && tileGroupIds.length) {
        state.addTile(pick(tileGroupIds), { id: `t${id++}`, tileGroupId: '', position: position(), size: 1 + Math.floor(next() * 4) });
      } else if (roll < 0.25 && tiles.length) {
        const tile = pick(tiles);
        state.updateTile(tile.group, tile.id, next() < 0.5 ? { position: position() } : { size: 1 + Math.floor(next() * 4) });
      } else if (roll < 0.3 && tiles.length) {
        const tile = pick(tiles);
        state.removeTile(next() < 0.3 ? pick(tileGroupIds) : tile.group, tile.id);
      } else if (roll < 0.38) {
        state.addTileGroup({
          id: `g${id++}`, name: 'probe', floorMeshId: 'wood-floor',
          tiles: [{ id: `t${id++}`, tileGroupId: '', position: position(), size: 2 }, { id: `t${id++}`, tileGroupId: '', position: position() }],
        });
      } else if (roll < 0.44 && tileGroupIds.length) {
        const groupId = pick(tileGroupIds);
        state.updateTileGroup(groupId, {
          tiles: [...state.tileGroups.get(groupId)!.tiles.slice(1), { id: `t${id++}`, tileGroupId: groupId, position: position(), size: 3 }],
        });
      } else if (roll < 0.47 && tileGroupIds.length) {
        state.removeTileGroup(pick(tileGroupIds));
      } else if (roll < 0.62 && wallGroupIds.length) {
        const groupId = pick(wallGroupIds);
        state.addWall(groupId, wall(groupId));
      } else if (roll < 0.7 && walls.length) {
        const target = pick(walls);
        const { position: moved, rotation } = wall(target.group);
        state.updateWall(target.group, target.id, { position: moved, rotation });
      } else if (roll < 0.78 && walls.length) {
        const target = pick(walls);
        state.removeWall(next() < 0.3 ? pick(wallGroupIds) : target.group, target.id);
      } else if (roll < 0.86) {
        const groupId = `wg${id++}`;
        state.addWallGroup({ id: groupId, name: 'probe', walls: [wall(groupId), wall(groupId)] });
      } else if (roll < 0.92 && wallGroupIds.length) {
        const groupId = pick(wallGroupIds);
        state.updateWallGroup(groupId, { walls: [...state.wallGroups.get(groupId)!.walls.slice(1), wall(groupId)] });
      } else if (roll < 0.95 && wallGroupIds.length) {
        state.removeWallGroup(pick(wallGroupIds));
      } else {
        state.hydrate(state.serialize());
      }
    } catch {
      rejected++;
    }
  }

  const rebuilt = createBuildingStore();
  rebuilt.getState().hydrate(store.getState().serialize());
  expect(entries(store.getState().spatialIndex)).toEqual(entries(rebuilt.getState().spatialIndex));
  expect(rejected).toBeGreaterThan(0);
});
