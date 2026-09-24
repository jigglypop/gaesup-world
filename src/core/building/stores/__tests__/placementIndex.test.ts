import type { CellCoord } from '../../../grid';
import {
  blockToPlacementEntry,
  createBuildingPlacementEngine,
  createTileFootprint,
  tilePositionToCell,
  tileToPlacementEntry,
} from '../../model';
import type { BuildingBlockConfig, Position3D } from '../../types';
import { createBuildingStore } from '../buildingStore';

type Store = ReturnType<typeof createBuildingStore>;
type State = ReturnType<Store['getState']>;
type BlockSize = NonNullable<BuildingBlockConfig['size']>;

const CELL = 4;
const SPAN = 5;

function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => (state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}

// The engine-backed checks the spatial index replaced, rebuilt from the current data for every comparison.
function engineOracle(state: State) {
  const engine = createBuildingPlacementEngine(state.tileGroups.values(), state.wallGroups.values(), { blocks: state.blocks });
  const occupied = (entry: ReturnType<typeof tileToPlacementEntry>) =>
    !engine.canPlace({ subject: entry.subject, coord: entry.coord, footprint: entry.footprint }).ok;
  return {
    tile: (position: Position3D, size: number) => {
      const cell = tilePositionToCell(position);
      return occupied(tileToPlacementEntry({
        id: '__candidate_tile__', tileGroupId: 'candidate', position, size, cell, footprint: createTileFootprint(cell, size),
      }));
    },
    block: (position: Position3D, size: BlockSize) =>
      occupied(blockToPlacementEntry({ id: '__candidate_block__', position, size })),
  };
}

type Tally = { mismatches: string[]; occupied: number; probes: number };

function compare(store: Store, next: () => number, probes: number, label: string, tally: Tally): void {
  const oracle = engineOracle(store.getState());
  for (let probe = 0; probe < probes; probe++) {
    const position = {
      x: Math.round((next() * 2 - 1) * SPAN) * CELL + (next() < 0.2 ? next() * 3 - 1.5 : 0),
      y: Math.floor(next() * 4),
      z: Math.round((next() * 2 - 1) * SPAN) * CELL,
    };
    const tileSize = 1 + Math.floor(next() * 3);
    const blockSize = { x: 1 + Math.floor(next() * 2), y: 1 + Math.floor(next() * 3), z: 1 + Math.floor(next() * 2) };
    store.getState().setTileMultiplier(tileSize);
    const expected = [oracle.tile(position, tileSize), oracle.block(position, blockSize)];
    const actual = [store.getState().checkTilePosition(position), store.getState().checkBlockPosition({ position, size: blockSize })];
    if (actual[0] !== expected[0] || actual[1] !== expected[1]) {
      tally.mismatches.push(`${label} ${JSON.stringify({ position, tileSize, blockSize, expected, actual })}`);
    }
    tally.occupied += Number(expected[0]) + Number(expected[1]);
    tally.probes += 2;
  }
}

describe('placement checks from the spatial index', () => {
  it.each([1, 7, 42])('match a rebuilt placement engine across random edits (seed %i)', (seed) => {
    const next = random(seed);
    const store = createBuildingStore();
    store.getState().initializeDefaults();
    const pick = <T,>(items: readonly T[]): T | undefined => items[Math.floor(next() * items.length)];
    const cellAt = (): CellCoord => ({
      x: Math.round((next() * 2 - 1) * SPAN), z: Math.round((next() * 2 - 1) * SPAN), level: Math.floor(next() * 3),
    });
    const positionAt = (): Position3D => {
      const cell = cellAt();
      return { x: cell.x * CELL + (next() < 0.25 ? next() * 3 - 1.5 : 0), y: cell.level, z: cell.z * CELL };
    };
    const tileGroupIds = () => [...store.getState().tileGroups.keys()];
    const tiles = () => [...store.getState().tileGroups.values()].flatMap((group) => group.tiles.map((tile) => ({ group: group.id, tile })));
    const tally: Tally = { mismatches: [], occupied: 0, probes: 0 };
    let id = 0;

    for (let step = 0; step < 160; step++) {
      const state = store.getState();
      const roll = next();
      const existing = pick(tiles());
      const block = pick(state.blocks);
      if (roll < 0.3) {
        const tile = { id: `t${id++}`, tileGroupId: '', position: positionAt(), size: 1 + Math.floor(next() * 3) };
        const groupId = pick(tileGroupIds())!;
        const footprint = next() < 0.15 ? [cellAt(), cellAt()] : undefined;
        state.addTile(groupId, { ...tile, tileGroupId: groupId, ...(footprint ? { footprint } : {}) });
      } else if (roll < 0.45) {
        state.addBlock({
          id: `b${id++}`,
          position: positionAt(),
          size: { x: 1 + Math.floor(next() * 2), y: 1 + Math.floor(next() * 3), z: 1 + Math.floor(next() * 2) },
        });
      } else if (roll < 0.5) {
        const groupId = pick([...state.wallGroups.keys()])!;
        state.addWall(groupId, { id: `w${id++}`, wallGroupId: groupId, position: positionAt(), rotation: { x: 0, y: 0, z: 0 } });
      } else if (roll < 0.6 && existing) {
        const wrongGroup = next() < 0.3 ? pick(tileGroupIds().filter((groupId) => groupId !== existing.group)) : undefined;
        state.removeTile(wrongGroup ?? existing.group, existing.tile.id);
      } else if (roll < 0.66 && block) {
        state.removeBlock(next() < 0.2 && existing ? existing.tile.id : block.id);
      } else if (roll < 0.76 && existing) {
        const kind = Math.floor(next() * 5);
        state.updateTile(existing.group, existing.tile.id, kind === 0
          ? { position: positionAt() }
          : kind === 1 ? { size: 1 + Math.floor(next() * 3) }
            : kind === 2 ? { cell: cellAt() }
              : kind === 3 ? { footprint: [cellAt()] } : { materialId: 'probe' });
      } else if (roll < 0.84 && block) {
        const kind = Math.floor(next() * 3);
        state.updateBlock(block.id, kind === 0
          ? { position: positionAt() }
          : kind === 1 ? { size: { x: 2, y: 1 + Math.floor(next() * 2), z: 1 } } : { cell: cellAt() });
      } else if (roll < 0.88) {
        state.addTileGroup({
          id: `g${id++}`, name: 'probe', floorMeshId: 'wood-floor',
          tiles: [{ id: `t${id++}`, tileGroupId: '', position: positionAt(), size: 2 }, { id: `t${id++}`, tileGroupId: '', position: positionAt() }],
        });
      } else if (roll < 0.92 && existing) {
        const group = state.tileGroups.get(existing.group)!;
        state.updateTileGroup(group.id, {
          tiles: [...group.tiles.filter((tile) => tile.id !== existing.tile.id), { id: `t${id++}`, tileGroupId: group.id, position: positionAt() }],
        });
      } else if (roll < 0.94) {
        state.removeTileGroup(pick(tileGroupIds())!);
      } else if (roll < 0.97) {
        state.hydrate(state.serialize());
      }
      compare(store, next, step % 40 === 39 ? 1500 : 60, `step ${step}`, tally);
    }

    expect(tally.mismatches).toEqual([]);
    // Both answers must be common, or agreement would prove little.
    expect(tally.occupied / tally.probes).toBeGreaterThan(0.1);
    expect(tally.occupied / tally.probes).toBeLessThan(0.9);
  });

  it('keeps a tile occupied when removal names a group that does not hold it', () => {
    const store = createBuildingStore();
    store.getState().initializeDefaults();
    const [first, second] = [...store.getState().tileGroups.keys()];
    const position = { x: 800, y: 0, z: 800 };
    store.getState().addTile(first!, { id: 'kept', tileGroupId: first!, position, size: 1 });
    store.getState().removeTile(second!, 'kept');
    expect(store.getState().checkTilePosition(position)).toBe(true);
    expect(store.getState().getSupportHeightAt(position)).toBe(1);
    store.getState().removeTile(first!, 'kept');
    expect(store.getState().checkTilePosition(position)).toBe(false);
  });

  it('rejects an oversized block before it enters the store or the index', () => {
    const store = createBuildingStore();
    const before = store.getState();
    expect(() => before.addBlock({ id: 'huge', position: { x: 0, y: 0, z: 0 }, size: { x: 300, y: 1, z: 300 } })).toThrow(RangeError);
    expect(store.getState()).toBe(before);
    expect(before.checkBlockPosition({ position: { x: 0, y: 0, z: 0 } })).toBe(false);
  });
});
