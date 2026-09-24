import type { BuildingBlockConfig, TileConfig, WallConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { createBlockColliders } from '../BlockSystem/layout';
import { createTileColliders, getRampLayout, getStairLayout } from '../TileSystem/layout';
import { createWallColliders } from '../WallSystem/colliders';

const tile = (overrides: Partial<TileConfig>): TileConfig => ({
  id: 'tile',
  tileGroupId: 'group',
  position: { x: 0, y: 0, z: 0 },
  size: 1,
  ...overrides,
});

describe('building collider boxes', () => {
  test('flat and elevated box tiles keep their half extents', () => {
    const size = TILE_CONSTANTS.GRID_CELL_SIZE;
    expect(createTileColliders([tile({ id: 'flat', position: { x: 4, y: 0, z: 8 } })])).toEqual([
      { key: 'flat', position: [4, -0.02, 8], rotation: [0, 0, 0], args: [size / 2, 0.02, size / 2] },
    ]);
    expect(createTileColliders([tile({ id: 'high', position: { x: 0, y: 2, z: 0 }, rotation: 1 })])).toEqual([
      { key: 'high', position: [0, 1, 0], rotation: [0, 1, 0], args: [size / 2, 1, size / 2] },
    ]);
  });

  test('same-height unit box tiles merge into rectangles per lattice and height', () => {
    const size = TILE_CONSTANTS.GRID_CELL_SIZE;
    const floor = Array.from({ length: 20 }, (_, i) => tile({ id: `f${i}`, position: { x: (i % 5) * size, y: 0, z: Math.floor(i / 5) * size } }));
    expect(createTileColliders(floor)).toEqual([
      { key: 'f0:x20', position: [2 * size, -0.02, 1.5 * size], rotation: [0, 0, 0], args: [2.5 * size, 0.02, 2 * size] },
    ]);
    const lShape = [
      tile({ id: 'a', position: { x: 0, y: 0, z: 0 } }), tile({ id: 'b', position: { x: size, y: 0, z: 0 } }),
      tile({ id: 'c', position: { x: 0, y: 0, z: size } }),
      tile({ id: 'raised', position: { x: 2 * size, y: 1, z: 0 } }),
      tile({ id: 'offset', position: { x: 1, y: 0, z: 2 * size } }),
      tile({ id: 'turned', position: { x: 0, y: 0, z: 3 * size }, rotation: Math.PI / 2 }),
      tile({ id: 'skewed', position: { x: 0, y: 0, z: 5 * size }, rotation: 0.3 }),
    ];
    const boxes = createTileColliders(lShape);
    expect(boxes.map((box) => box.key).sort()).toEqual(['a:x2', 'c', 'offset', 'raised', 'skewed', 'turned']);
    expect(boxes.find((box) => box.key === 'skewed')?.rotation).toEqual([0, 0.3, 0]);
  });

  test('round tiles produce a core and four rings', () => {
    const boxes = createTileColliders([tile({ id: 'round', shape: 'round' })]);
    expect(boxes.map((box) => box.key)).toEqual(['round-core', 'round-ring-0', 'round-ring-1', 'round-ring-2', 'round-ring-3']);
    expect(boxes[2]?.rotation).toEqual([0, Math.PI / 4, 0]);
  });

  test('stairs and ramps are sliced into rising boxes', () => {
    const stairs = tile({ id: 'stairs', shape: 'stairs', position: { x: 0, y: 2, z: 0 } });
    const ramp = tile({ id: 'ramp', shape: 'ramp', position: { x: 0, y: 2, z: 0 } });
    const stairBoxes = createTileColliders([stairs]);
    const rampBoxes = createTileColliders([ramp]);

    expect(stairBoxes).toHaveLength(getStairLayout(stairs).colliderSlices);
    expect(rampBoxes).toHaveLength(getRampLayout(ramp).rampSlices);
    expect(stairBoxes.at(-1)?.args[1]).toBeCloseTo(1);
    expect(rampBoxes[0]?.key).toBe('ramp-ramp-0');
  });

  test('walls are offset by half their width along their facing', () => {
    const wall: WallConfig = {
      id: 'wall',
      wallGroupId: 'walls',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const { WIDTH, HEIGHT, THICKNESS } = TILE_CONSTANTS.WALL_SIZES;
    expect(createWallColliders([wall])).toEqual([
      { key: 'wall', position: [0, HEIGHT / 2, WIDTH / 2], rotation: [0, 0, 0], args: [WIDTH / 2, HEIGHT / 2, THICKNESS / 2] },
    ]);
  });

  test('blocks cover their footprint from the cell corner', () => {
    const block: BuildingBlockConfig = { id: 'block', position: { x: 0, y: 0, z: 0 }, size: { x: 2, y: 1, z: 1 } };
    const cell = TILE_CONSTANTS.GRID_CELL_SIZE;
    expect(createBlockColliders([block])).toEqual([
      {
        key: 'block',
        position: [cell / 2, TILE_CONSTANTS.HEIGHT_STEP / 2, 0],
        rotation: [0, 0, 0],
        args: [cell, TILE_CONSTANTS.HEIGHT_STEP / 2, cell / 2],
      },
    ]);
  });
});
