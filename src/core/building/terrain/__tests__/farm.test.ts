import { createBuildingStore } from '../../stores/buildingStore';
import type { FarmPlotConfig, TileConfig } from '../../types';
import { CROP_LOD, CROPS, FARM_NEAR_TIER, plantDraw, plotKey, readFarmPlot, readTilePlot } from '../farm/config';
import { cropLayout, FARM_EDGE, farmSquares, soilAt, weedLayout, type FarmSquare } from '../farm/layout';
import { buildFarmBoards, buildFarmSoil } from '../farm/soil';

const farmTile = (id: string, x: number, z: number, farm: FarmPlotConfig = {}, y = 0): TileConfig =>
  ({ id, tileGroupId: 'ground', size: 1, position: { x, y, z }, objectType: 'farm', objectConfig: { farm } });

const point = () => ({ height: 0, trough: 0, bank: 0, distance: 0 });

describe('farm plot config', () => {
  it('fills a missing plot: bare tilled soil, ripe, rows along x, a ridge', () => {
    expect(readFarmPlot(undefined)).toEqual({ crop: 'none', soil: 'tilled', stage: 'ripe', rows: 'x', edge: 'ridge' });
  });

  it('gives a crop its own soil unless the plot names one', () => {
    expect(readFarmPlot({ crop: 'rice' }).soil).toBe('paddy');
    expect(readFarmPlot({ crop: 'rice', soil: 'watered' }).soil).toBe('watered');
    expect(readFarmPlot({ crop: 'wheat' }).soil).toBe('tilled');
  });

  it('turns rows with the tile when the plot names no direction', () => {
    expect(readFarmPlot({}, Math.PI / 2).rows).toBe('z');
    expect(readFarmPlot({}, Math.PI).rows).toBe('x');
    expect(readFarmPlot({}, -Math.PI / 2).rows).toBe('z');
    expect(readFarmPlot({ rows: 'x' }, Math.PI / 2).rows).toBe('x');
  });

  it('reads unknown values as the defaults and older names as today’s', () => {
    expect(readFarmPlot({ crop: 'mandrake', soil: 'lava', stage: 'rotten', rows: 'diagonal', edge: 'moat' }))
      .toEqual({ crop: 'none', soil: 'tilled', stage: 'ripe', rows: 'x', edge: 'ridge' });
    expect(readFarmPlot({ kind: 'carrot-bed' }).crop).toBe('carrot');
    expect(readFarmPlot({ crop: 'Sprouts' })).toMatchObject({ crop: 'lettuce', stage: 'sprout' });
    expect(readFarmPlot({ crop: 'corn', stage: 1 }).stage).toBe('young');
    expect(readFarmPlot({ crop: 'corn', stage: 'growing' }).stage).toBe('young');
    expect(readFarmPlot('not an object')).toEqual(readFarmPlot(undefined));
  });

  it('keys plots by every choice, so only matching tiles join a bed', () => {
    const tile = farmTile('a', 0, 0, { crop: 'tulip', rows: 'z' });
    expect(plotKey(readTilePlot(tile))).toBe('tilled|tulip|ripe|z|ridge');
    expect(plotKey(readFarmPlot({ crop: 'tulip' }))).not.toBe(plotKey(readTilePlot(tile)));
  });
});

describe('farm beds', () => {
  const bed = (tiles: TileConfig[]) => farmSquares(tiles);

  it('joins neighbors of the same plot and height, not others', () => {
    const [a, b, c, d] = bed([
      farmTile('a', 0, 0, { crop: 'wheat' }),
      farmTile('b', 4, 0, { crop: 'wheat' }),
      farmTile('c', 0, 4, { crop: 'corn' }),
      farmTile('d', -4, 0, { crop: 'wheat' }, 1),
    ]);
    expect(a!.mask & 2).toBe(2);
    expect(b!.mask & 1).toBe(1);
    expect(a!.mask & 8).toBe(0);
    expect(a!.mask & 1).toBe(0);
    expect(c!.mask).toBe(0);
    expect(d!.mask).toBe(0);
  });

  it('leaves other covers and shaped tiles out', () => {
    const tiles: TileConfig[] = [farmTile('a', 0, 0), { ...farmTile('b', 4, 0), shape: 'ramp' }, { ...farmTile('c', 8, 0), objectType: 'dirt' }];
    expect(bed(tiles).map((square) => square.x)).toEqual([0]);
  });

  it('meets itself across a shared side: the soil there has one height from either tile', () => {
    const [a, b] = bed([farmTile('a', 0, 0, { crop: 'carrot' }), farmTile('b', 4, 0, { crop: 'carrot' })]);
    for (const z of [-1.3, 0, 0.7, 1.9]) {
      expect(soilAt(a!, 2, z, point()).height).toBeCloseTo(soilAt(b!, -2, z, point()).height, 6);
    }
  });

  it('settles to the tile top at an open border and raises a bank just inside it', () => {
    const [square] = bed([farmTile('a', 0, 0)]);
    const edge = soilAt(square!, -2, 0, point()), crest = soilAt(square!, -2 + 0.21, 0, point()), inside = soilAt(square!, 0, 0, point());
    expect(edge.height).toBeLessThan(0.01);
    expect(crest.height).toBeGreaterThan(inside.height);
    expect(crest.bank).toBeGreaterThan(0.8);
    expect(inside.distance).toBeCloseTo(2, 6);
  });

  it('runs furrows across the rows at the crop’s spacing', () => {
    const [square] = bed([farmTile('a', 0, 0, { crop: 'lettuce' })]);
    const row = CROPS.lettuce.row;
    const crest = soilAt(square!, 0, row * 0.5, point()), trough = soilAt(square!, 0, 0, point());
    expect(crest.trough).toBeLessThan(0.05);
    expect(trough.trough).toBeGreaterThan(0.9);
    expect(soilAt(square!, 0.8, row * 0.5, point()).height).toBeCloseTo(soilAt(square!, 0.3, row * 0.5, point()).height, 1);
  });
});

describe('crop rows', () => {
  const layoutOf = (farm: FarmPlotConfig, xs = [0, 4]) => {
    const squares = farmSquares(xs.map((x, i) => farmTile(`t${i}`, x, 0, farm)));
    return { squares, layout: cropLayout(squares) };
  };
  const plants = (layout: ReturnType<typeof cropLayout>) =>
    Array.from({ length: layout.count }, (_, i) => ({ x: layout.roots[i * 4]!, z: layout.roots[i * 4 + 2]!, rank: layout.roots[i * 4 + 3]! }));

  it('puts the rows of neighboring tiles on one world grid, so they run on across the join', () => {
    const { layout } = layoutOf({ crop: 'cabbage' });
    const rows = (inTile: (x: number) => boolean) => [...new Set(plants(layout).filter((p) => inTile(p.x)).map((p) => Math.round(p.z / CROPS.cabbage.row - 0.5)))].sort();
    expect(rows((x) => x < 2)).toEqual(rows((x) => x >= 2));
    expect(rows((x) => x < 2).length).toBeGreaterThan(3);
  });

  it('plants across the join but keeps clear of the open border', () => {
    const { squares, layout } = layoutOf({ crop: 'lettuce' });
    const margin = FARM_EDGE.ridge.margin;
    const all = plants(layout);
    expect(all.some((p) => Math.abs(p.x - 2) < CROPS.lettuce.gap)).toBe(true);
    for (const p of all) {
      const square = squares.find((s) => Math.abs(p.x - s.x) <= 2 && Math.abs(p.z - s.z) <= 2) as FarmSquare;
      expect(soilAt(square, p.x - square.x, p.z - square.z, point()).distance).toBeGreaterThanOrEqual(margin);
    }
  });

  it('turns the rows with the plot', () => {
    // Plants stand on row centers, half a spacing off the world grid, across the rows only.
    const offRow = (value: number) => Math.abs(((value / CROPS.corn.row) % 1 + 1) % 1 - 0.5);
    const along = plants(layoutOf({ crop: 'corn', rows: 'x' }, [0]).layout);
    const across = plants(layoutOf({ crop: 'corn', rows: 'z' }, [0]).layout);
    expect(Math.max(...along.map((p) => offRow(p.z)))).toBeLessThan(0.1);
    expect(Math.max(...across.map((p) => offRow(p.x)))).toBeLessThan(0.1);
    expect(Math.max(...along.map((p) => offRow(p.x)))).toBeGreaterThan(0.2);
  });

  it('lists plants by draw rank and lays them out the same every time', () => {
    const first = layoutOf({ crop: 'tulip' }).layout, again = layoutOf({ crop: 'tulip' }).layout;
    const ranks = plants(first).map((p) => p.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(Array.from(first.roots)).toEqual(Array.from(again.roots));
  });

  it('colors flowers row by row and grows nothing on a bare bed', () => {
    const { layout } = layoutOf({ crop: 'tulip' }, [0]);
    const blooms = new Set(Array.from({ length: layout.count }, (_, i) => layout.tints[i * 4]!.toFixed(3)));
    expect(blooms.size).toBe(CROPS.tulip.blooms!.length);
    expect(layoutOf({}).layout.count).toBe(0);
  });

  it('grows weeds on fallow soil only', () => {
    expect(weedLayout(farmSquares([farmTile('a', 0, 0, { soil: 'fallow' })])).count).toBeGreaterThan(10);
    expect(weedLayout(farmSquares([farmTile('a', 0, 0)])).count).toBe(0);
  });
});

describe('farm LOD', () => {
  it('draws every plant near, thins with distance and none past the far end', () => {
    expect(plantDraw(500, 5, false)).toEqual({ count: 500, tier: 0 });
    expect(plantDraw(500, CROP_LOD.low.far + 1, false).count).toBe(0);
    const counts = [10, 30, 45, 60, 70].map((distance) => plantDraw(500, distance, false).count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(counts[3]!).toBeLessThan(500);
  });

  it('keeps tall crops longer, in detail and in number', () => {
    const distance = FARM_NEAR_TIER + 5;
    expect(plantDraw(100, distance, false).tier).toBe(1);
    expect(plantDraw(100, distance, true).tier).toBe(0);
    expect(plantDraw(100, 60, true).count).toBeGreaterThan(plantDraw(100, 60, false).count);
  });

  it('draws the shrinking band on top of the share, never past the list', () => {
    const plain = plantDraw(400, 55, false).count, banded = plantDraw(400, 55, false, 0.18).count;
    expect(banded).toBeGreaterThan(plain);
    expect(plantDraw(400, 1, false, 0.18).count).toBe(400);
  });
});

describe('farm soil geometry', () => {
  const vertices = (geometry: NonNullable<ReturnType<typeof buildFarmSoil>['surface']>) => {
    const position = geometry.getAttribute('position');
    return Array.from({ length: position.count }, (_, i) => [position.getX(i), position.getY(i), position.getZ(i)] as const);
  };

  it('shares the vertices of a join between the tiles of a bed', () => {
    const { surface } = buildFarmSoil(farmSquares([farmTile('a', 0, 0, { crop: 'potato' }), farmTile('b', 4, 0, { crop: 'potato' })]));
    const onJoin = vertices(surface!).filter(([x]) => Math.abs(x - 2) < 1e-5).map(([, y, z]) => `${z.toFixed(4)}:${y.toFixed(5)}`);
    const counts = new Map<string, number>();
    for (const key of onJoin) counts.set(key, (counts.get(key) ?? 0) + 1);
    expect([...counts.values()].every((count) => count === 2)).toBe(true);
    expect(surface!.getAttribute('farmSoil').itemSize).toBe(4);
  });

  it('floods paddies only, inside their banks', () => {
    const paddy = buildFarmSoil(farmSquares([farmTile('a', 0, 0, { crop: 'rice' })]));
    const dry = buildFarmSoil(farmSquares([farmTile('a', 0, 0, { crop: 'wheat' })]));
    expect(dry.water).toBeNull();
    const water = paddy.water!.getAttribute('position');
    for (let i = 0; i < water.count; i++) expect(Math.max(Math.abs(water.getX(i)), Math.abs(water.getZ(i)))).toBeLessThan(2 - 0.15);
  });

  it('edges wood beds with boards on their open sides only', () => {
    expect(buildFarmBoards(farmSquares([farmTile('a', 0, 0)]))).toBeNull();
    const one = buildFarmBoards(farmSquares([farmTile('a', 0, 0, { edge: 'wood' })]))!.getAttribute('position').count;
    const two = buildFarmBoards(farmSquares([farmTile('a', 0, 0, { edge: 'wood' }), farmTile('b', 4, 0, { edge: 'wood' })]))!.getAttribute('position').count;
    // Two joined tiles have six open sides to the one tile's four, and share the posts where they meet.
    expect(two).toBeGreaterThan(one);
    expect(two).toBeLessThan(one * 2);
  });
});

describe('farm tiles in the building store', () => {
  it('places and paints farm tiles with the current plot', () => {
    const store = createBuildingStore();
    const state = () => store.getState();
    state().hydrate({
      version: 1,
      meshes: [{ id: 'lawn', color: '#8ccd65' }],
      tileGroups: [{ id: 'ground', name: 'ground', floorMeshId: 'lawn', tiles: [{ id: 'tile-a', tileGroupId: 'ground', size: 1, position: { x: 0, y: 0, z: 0 } }] }],
      wallGroups: [],
      objects: [],
    });
    state().setSelectedTileObjectType('farm');
    state().setCurrentFarm({ crop: 'sunflower', edge: 'wood' });
    state().setEditMode('tile');
    state().setBuildingTool('paint');
    state().applyToolTo('tile-a');
    state().addTile('ground', { id: 'tile-b', tileGroupId: 'ground', size: 1, position: { x: 4, y: 0, z: 0 } });
    const [a, b] = state().tileGroups.get('ground')!.tiles;
    expect(a!.objectType).toBe('farm');
    expect(a!.objectConfig?.farm).toEqual({ crop: 'sunflower', edge: 'wood' });
    expect(b!.objectConfig?.farm).toEqual({ crop: 'sunflower', edge: 'wood' });
    expect(a!.objectConfig?.farm).not.toBe(b!.objectConfig?.farm);
  });
});
