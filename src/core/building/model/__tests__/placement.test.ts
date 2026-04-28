import {
  buildingCellToWorld,
  blockToPlacementEntry,
  createBuildingPlacementEngine,
  buildingGroupsToPlacementEntries,
  buildingPlacementAdapter,
  edgeKey,
  edgeSideToWallRotation,
  edgeToWallTransform,
  cellToTilePosition,
  createBlockFootprint,
  createTileFootprint,
  getTileSupportHeight,
  hasTileCollision,
  hasWallCollision,
  indexAabb,
  pair,
  queryAabbIds,
  snapBuildingPosition,
  tileGroupToPlacementEntries,
  tileFootprintKeys,
  tileHalfSize,
  tileOverlaps,
  tilePositionToCell,
  tileToPlacementEntry,
  unindexId,
  wallGroupToPlacementEntries,
  wallToPlacementEntry,
  wallTransformToEdge,
  worldToBuildingCell,
  normalizeQuarterTurnRotation,
} from '../index';
import type { TileMeta, WallMeta } from '../index';
import { createNoOverlapRule, createPlacementEngine } from '../../../placement';

describe('building placement model helpers', () => {
  it('snaps x/z positions while preserving y and extra fields', () => {
    expect(snapBuildingPosition({ x: 5.9, y: 1.25, z: -6.1, label: 'hover' })).toEqual({
      x: 4,
      y: 1.25,
      z: -8,
      label: 'hover',
    });
  });

  it('converts between building cells and world positions', () => {
    const cell = { x: 2, z: -3, level: 4 };

    expect(buildingCellToWorld(cell)).toEqual({ x: 8, y: 4, z: -12 });
    expect(worldToBuildingCell({ x: 8.1, y: 4.2, z: -11.9 })).toEqual(cell);
  });

  it('converts tile positions and cells for migration metadata', () => {
    expect(tilePositionToCell({ x: 8.1, y: 2.2, z: -3.9 })).toEqual({
      x: 2,
      z: -1,
      level: 2,
    });
    expect(cellToTilePosition({ x: 2, z: -1, level: 2 })).toEqual({
      x: 8,
      y: 2,
      z: -4,
    });
  });

  it('creates deterministic tile footprints from a center cell and size', () => {
    expect(createTileFootprint({ x: 0, z: 0, level: 0 }, 1)).toEqual([
      { x: 0, z: 0, level: 0 },
    ]);
    expect(createTileFootprint({ x: 0, z: 0, level: 0 }, 2)).toEqual([
      { x: -1, z: -1, level: 0 },
      { x: -1, z: 0, level: 0 },
      { x: 0, z: -1, level: 0 },
      { x: 0, z: 0, level: 0 },
    ]);
    expect(createTileFootprint({ x: 0, z: 0, level: 0 }, 3)).toEqual([
      { x: -1, z: -1, level: 0 },
      { x: -1, z: 0, level: 0 },
      { x: -1, z: 1, level: 0 },
      { x: 0, z: -1, level: 0 },
      { x: 0, z: 0, level: 0 },
      { x: 0, z: 1, level: 0 },
      { x: 1, z: -1, level: 0 },
      { x: 1, z: 0, level: 0 },
      { x: 1, z: 1, level: 0 },
    ]);
    expect(tileFootprintKeys(createTileFootprint({ x: 0, z: 0, level: 0 }, 2))).toEqual([
      '-1:-1:0',
      '-1:0:0',
      '0:-1:0',
      '0:0:0',
    ]);
  });

  it('creates voxel-style block footprints from an anchor cell and size', () => {
    expect(createBlockFootprint({ x: 0, z: 0, level: 0 })).toEqual([
      { x: 0, z: 0, level: 0 },
    ]);
    expect(createBlockFootprint({ x: 0, z: 0, level: 0 }, { x: 2, y: 2, z: 1 })).toEqual([
      { x: 0, z: 0, level: 0 },
      { x: 0, z: 0, level: 1 },
      { x: 1, z: 0, level: 0 },
      { x: 1, z: 0, level: 1 },
    ]);
  });

  it('adapts building cell and edge coordinates for placement engine usage', () => {
    const cellCoord = { kind: 'cell' as const, cell: { x: 1, z: 2, level: 0 } };
    const edgeCoord = { kind: 'edge' as const, edge: { x: 1, z: 2, level: 0, side: 'north' as const } };

    expect(buildingPlacementAdapter.key(cellCoord)).toBe('cell:1:2:0');
    expect(buildingPlacementAdapter.key(edgeCoord)).toBe('edge:1:2:0:north');
    expect(buildingPlacementAdapter.toWorld(cellCoord)).toEqual({ x: 4, y: 0, z: 8 });
    expect(buildingPlacementAdapter.toWorld(edgeCoord)).toEqual({ x: 4, y: 0, z: 6 });
    expect(buildingPlacementAdapter.fromWorld({ x: 4.1, y: 0, z: 7.9 })).toEqual(cellCoord);
    expect(buildingPlacementAdapter.getNeighbors(cellCoord)).toEqual([
      { kind: 'cell', cell: { x: 1, z: 1, level: 0 } },
      { kind: 'cell', cell: { x: 2, z: 2, level: 0 } },
      { kind: 'cell', cell: { x: 1, z: 3, level: 0 } },
      { kind: 'cell', cell: { x: 0, z: 2, level: 0 } },
    ]);
    expect(buildingPlacementAdapter.getNeighbors(edgeCoord)).toEqual([edgeCoord]);
    expect(buildingPlacementAdapter.equals(cellCoord, { kind: 'cell', cell: { x: 1, z: 2, level: 0 } })).toBe(true);
  });

  it('converts tiles and walls into placement entries', () => {
    const tileEntry = tileToPlacementEntry({
      id: 'tile-1',
      position: { x: 0, y: 0, z: 0 },
      tileGroupId: 'floor',
      size: 2,
      shape: 'round',
      objectType: 'grass',
      rotation: Math.PI / 2,
    });
    const wallEntry = wallToPlacementEntry({
      id: 'wall-1',
      position: { x: -2, y: 0, z: -2 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      wallGroupId: 'walls',
    });

    expect(tileEntry).toEqual(expect.objectContaining({
      id: 'tile-1',
      rotation: Math.PI / 2,
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
      subject: expect.objectContaining({
        type: 'tile',
        tags: ['building', 'tile', 'shape:round', 'terrain:grass'],
      }),
    }));
    expect(tileEntry.footprint.coords).toEqual([
      { kind: 'cell', cell: { x: -1, z: -1, level: 0 } },
      { kind: 'cell', cell: { x: -1, z: 0, level: 0 } },
      { kind: 'cell', cell: { x: 0, z: -1, level: 0 } },
      { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
    ]);
    expect(wallEntry).toEqual({
      id: 'wall-1',
      subject: {
        id: 'wall-1',
        type: 'wall',
        tags: ['building', 'wall', 'side:north'],
      },
      coord: { kind: 'edge', edge: { x: 0, z: 0, level: 0, side: 'north' } },
      footprint: {
        kind: 'edge',
        coords: [{ kind: 'edge', edge: { x: 0, z: 0, level: 0, side: 'north' } }],
      },
      rotation: Math.PI / 2,
    });
  });

  it('converts voxel-style blocks into placement entries', () => {
    const entry = blockToPlacementEntry({
      id: 'stone-1',
      position: { x: 4, y: 2, z: 8 },
      size: { x: 2, y: 2, z: 1 },
      materialId: 'stone',
      tags: ['wall'],
    });

    expect(entry).toEqual({
      id: 'stone-1',
      subject: {
        id: 'stone-1',
        type: 'block',
        tags: ['building', 'block', 'material:stone', 'wall'],
      },
      coord: { kind: 'cell', cell: { x: 1, z: 2, level: 2 } },
      footprint: {
        kind: 'volume',
        coords: [
          { kind: 'cell', cell: { x: 1, z: 2, level: 2 } },
          { kind: 'cell', cell: { x: 1, z: 2, level: 3 } },
          { kind: 'cell', cell: { x: 2, z: 2, level: 2 } },
          { kind: 'cell', cell: { x: 2, z: 2, level: 3 } },
        ],
      },
    });
  });

  it('converts building groups into placement entries usable by PlacementEngine', () => {
    const tileGroup = {
      id: 'floor',
      name: 'Floor',
      floorMeshId: 'wood',
      tiles: [
        { id: 'tile-1', position: { x: 0, y: 0, z: 0 }, tileGroupId: 'floor', size: 1 },
      ],
    };
    const wallGroup = {
      id: 'walls',
      name: 'Walls',
      walls: [
        { id: 'wall-1', position: { x: -2, y: 0, z: -2 }, rotation: { x: 0, y: Math.PI / 2, z: 0 }, wallGroupId: 'walls' },
      ],
    };

    expect(tileGroupToPlacementEntries(tileGroup)).toHaveLength(1);
    expect(wallGroupToPlacementEntries(wallGroup)).toHaveLength(1);

    const entries = buildingGroupsToPlacementEntries([tileGroup], [wallGroup]);
    const engine = createPlacementEngine({
      adapter: buildingPlacementAdapter,
      rules: [createNoOverlapRule()],
    });

    for (const entry of entries) {
      engine.place({
        subject: entry.subject,
        coord: entry.coord,
        footprint: entry.footprint,
        rotation: entry.rotation,
      });
    }

    expect(engine.getOccupants({ kind: 'cell', cell: { x: 0, z: 0, level: 0 } }).map((entry) => entry.id)).toEqual(['tile-1']);
    expect(engine.getOccupants({ kind: 'edge', edge: { x: 0, z: 0, level: 0, side: 'north' } }).map((entry) => entry.id)).toEqual(['wall-1']);
    expect(engine.canPlace({
      subject: { id: 'tile-2', type: 'tile' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
    }).ok).toBe(false);
  });

  it('builds a placement engine from current building groups', () => {
    const tileGroup = {
      id: 'floor',
      name: 'Floor',
      floorMeshId: 'wood',
      tiles: [
        { id: 'tile-1', position: { x: 0, y: 0, z: 0 }, tileGroupId: 'floor', size: 1 },
      ],
    };
    const wallGroup = {
      id: 'walls',
      name: 'Walls',
      walls: [
        { id: 'wall-1', position: { x: -2, y: 0, z: -2 }, rotation: { x: 0, y: Math.PI / 2, z: 0 }, wallGroupId: 'walls' },
      ],
    };

    const engine = createBuildingPlacementEngine([tileGroup], [wallGroup], {
      blocks: [
        { id: 'block-1', position: { x: 4, y: 0, z: 0 }, materialId: 'stone' },
      ],
    });

    expect(engine.list().map((entry) => entry.id)).toEqual(['tile-1', 'wall-1', 'block-1']);
    expect(engine.getOccupants({ kind: 'cell', cell: { x: 0, z: 0, level: 0 } }).map((entry) => entry.id)).toEqual(['tile-1']);
    expect(engine.getOccupants({ kind: 'cell', cell: { x: 1, z: 0, level: 0 } }).map((entry) => entry.id)).toEqual(['block-1']);
    expect(engine.getOccupants({ kind: 'edge', edge: { x: 0, z: 0, level: 0, side: 'north' } }).map((entry) => entry.id)).toEqual(['wall-1']);
    expect(engine.canPlace({
      subject: { id: 'tile-2', type: 'tile' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
    }).ok).toBe(false);
  });

  it('uses block volume footprints for Minecraft-style stacking and digging', () => {
    const engine = createBuildingPlacementEngine([], [], {
      blocks: [
        { id: 'ground', position: { x: 0, y: 0, z: 0 }, materialId: 'dirt' },
      ],
    });

    expect(engine.canPlace({
      subject: { id: 'same-cell', type: 'block' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
    }).ok).toBe(false);
    expect(engine.canPlace({
      subject: { id: 'stacked', type: 'block' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 1 } },
    }).ok).toBe(true);
    expect(engine.canPlace({
      subject: { id: 'pillar', type: 'block' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 1 } },
      footprint: {
        kind: 'volume',
        coords: createBlockFootprint({ x: 0, z: 0, level: 0 }, { x: 1, y: 3, z: 1 })
          .map((cell) => ({ kind: 'cell' as const, cell })),
      },
    }).ok).toBe(false);
  });

  it('loads existing overlapping building data without crashing but rejects new overlaps', () => {
    const engine = createBuildingPlacementEngine([
      {
        id: 'floor',
        name: 'Floor',
        floorMeshId: 'wood',
        tiles: [
          { id: 'tile-1', position: { x: 0, y: 0, z: 0 }, tileGroupId: 'floor', size: 2 },
          { id: 'tile-legacy-overlap', position: { x: 0, y: 0, z: 0 }, tileGroupId: 'floor', size: 1 },
        ],
      },
    ], []);

    expect(engine.list().map((entry) => entry.id)).toEqual(['tile-1', 'tile-legacy-overlap']);
    expect(engine.canPlace({
      subject: { id: 'tile-new', type: 'tile' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
    }).ok).toBe(false);
  });

  it('keeps placement engine tile overlap semantics aligned with legacy AABB checks', () => {
    const engine = createPlacementEngine({
      adapter: buildingPlacementAdapter,
      rules: [createNoOverlapRule()],
    });

    engine.place({
      subject: { id: 'tile-1', type: 'tile' },
      coord: { kind: 'cell', cell: { x: 0, z: 0, level: 0 } },
    });

    expect(engine.canPlace({
      subject: { id: 'tile-2', type: 'tile' },
      coord: { kind: 'cell', cell: { x: 1, z: 0, level: 0 } },
      footprint: {
        kind: 'cell',
        coords: createTileFootprint({ x: 1, z: 0, level: 0 }, 2).map((cell) => ({ kind: 'cell' as const, cell })),
      },
    }).ok).toBe(false);

    expect(hasTileCollision(
      new Map([[pair(0, 0), new Set(['tile-1'])]]),
      new Map([['tile-1', { x: 0, y: 0, z: 0, halfSize: tileHalfSize(1) }]]),
      { x: 4, y: 0, z: 0 },
      2,
    )).toBe(true);
  });

  it('normalizes wall rotations to quarter turns', () => {
    expect(normalizeQuarterTurnRotation(0.1)).toBe(0);
    expect(normalizeQuarterTurnRotation(Math.PI / 2 + 0.1)).toBe(Math.PI / 2);
    expect(normalizeQuarterTurnRotation(-Math.PI / 2)).toBe((Math.PI / 2) * 3);
    expect(normalizeQuarterTurnRotation(Math.PI * 2)).toBe(0);
  });

  it('converts edge coordinates to legacy wall transforms', () => {
    expect(edgeSideToWallRotation('north')).toBe(Math.PI / 2);
    expect(edgeSideToWallRotation('east')).toBe(0);
    expect(edgeKey({ x: 0, z: 0, level: 0, side: 'north' })).toBe('0:0:0:north');

    expect(edgeToWallTransform({ x: 0, z: 0, level: 0, side: 'north' })).toEqual({
      position: { x: -2, y: 0, z: -2 },
      rotationY: Math.PI / 2,
    });
    expect(edgeToWallTransform({ x: 0, z: 0, level: 0, side: 'east' })).toEqual({
      position: { x: 2, y: 0, z: -2 },
      rotationY: 0,
    });
    expect(edgeToWallTransform({ x: 0, z: 0, level: 0, side: 'south' })).toEqual({
      position: { x: -2, y: 0, z: 2 },
      rotationY: Math.PI / 2,
    });
    expect(edgeToWallTransform({ x: 0, z: 0, level: 0, side: 'west' })).toEqual({
      position: { x: -2, y: 0, z: -2 },
      rotationY: 0,
    });
  });

  it('infers edge coordinates from legacy wall transforms', () => {
    expect(wallTransformToEdge({ x: -2, y: 0, z: -2 }, Math.PI / 2)).toEqual({
      x: 0,
      z: 0,
      level: 0,
      side: 'north',
    });
    expect(wallTransformToEdge({ x: 2, y: 0, z: -2 }, 0)).toEqual({
      x: 0,
      z: 0,
      level: 0,
      side: 'east',
    });
    expect(wallTransformToEdge({ x: -2, y: 0, z: 2 }, Math.PI / 2)).toEqual({
      x: 0,
      z: 0,
      level: 0,
      side: 'south',
    });
    expect(wallTransformToEdge({ x: -2, y: 0, z: -2 }, 0)).toEqual({
      x: 0,
      z: 0,
      level: 0,
      side: 'west',
    });
  });

  it('creates deterministic spatial index keys for signed coordinates', () => {
    expect(pair(0, 0)).toBe(0);
    expect(pair(1, 0)).not.toBe(pair(-1, 0));
    expect(pair(0, 1)).not.toBe(pair(0, -1));
  });

  it('indexes, queries, and removes AABB ids', () => {
    const cells = new Map<number, Set<string>>();
    const cellsById = new Map<string, number[]>();

    indexAabb(cells, cellsById, 'tile', -2, 2, -2, 2, 4);

    expect(queryAabbIds(cells, 0, 0, 0, 0, 4)).toEqual(new Set(['tile']));
    expect(cellsById.get('tile')?.length).toBeGreaterThan(0);

    unindexId(cells, cellsById, 'tile');

    expect(queryAabbIds(cells, 0, 0, 0, 0, 4)).toEqual(new Set());
    expect(cellsById.has('tile')).toBe(false);
  });

  it('detects tile collisions using size and height', () => {
    const index = new Map<number, Set<string>>();
    const cells = new Map<string, number[]>();
    const meta = new Map<string, TileMeta>();
    const existing = { x: 100, y: 0, z: 100 };
    const halfSize = tileHalfSize(1);

    meta.set('tile', { ...existing, halfSize });
    indexAabb(index, cells, 'tile', existing.x - halfSize, existing.x + halfSize, existing.z - halfSize, existing.z + halfSize, 4);

    expect(hasTileCollision(index, meta, existing, 1)).toBe(true);
    expect(hasTileCollision(index, meta, { x: 104, y: 0, z: 100 }, 1)).toBe(false);
    expect(hasTileCollision(index, meta, { x: 104, y: 0, z: 100 }, 2)).toBe(true);
    expect(hasTileCollision(index, meta, { x: 100, y: 1, z: 100 }, 1)).toBe(false);
  });

  it('finds the highest support height under overlapping tiles', () => {
    const index = new Map<number, Set<string>>();
    const cells = new Map<string, number[]>();
    const meta = new Map<string, TileMeta>();

    for (const [id, y] of [['ground', 0], ['upper', 1]] as const) {
      const halfSize = tileHalfSize(1);
      meta.set(id, { x: 0, y, z: 0, halfSize });
      indexAabb(index, cells, id, -halfSize, halfSize, -halfSize, halfSize, 4);
    }

    expect(getTileSupportHeight(index, meta, { x: 0, y: 0, z: 0 }, 1)).toBe(2);
  });

  it('detects wall collisions by position and rotation', () => {
    const index = new Map<number, Set<string>>();
    const cells = new Map<string, number[]>();
    const meta = new Map<string, WallMeta>();

    meta.set('wall', { x: 0, z: 0, rotY: Math.PI / 2 });
    indexAabb(index, cells, 'wall', -0.5, 0.5, -0.5, 0.5, 1);

    expect(hasWallCollision(index, meta, { x: 0, y: 0, z: 0 }, Math.PI / 2)).toBe(true);
    expect(hasWallCollision(index, meta, { x: 1, y: 0, z: 0 }, Math.PI / 2)).toBe(false);
    expect(hasWallCollision(index, meta, { x: 0, y: 0, z: 0 }, 0)).toBe(false);
  });

  it('checks raw tile overlap with tolerance', () => {
    expect(tileOverlaps(
      { x: 0, z: 0, halfSize: 2 },
      { x: 3.8, z: 0, halfSize: 2 },
    )).toBe(true);
    expect(tileOverlaps(
      { x: 0, z: 0, halfSize: 2 },
      { x: 4, z: 0, halfSize: 2 },
    )).toBe(false);
  });
});
