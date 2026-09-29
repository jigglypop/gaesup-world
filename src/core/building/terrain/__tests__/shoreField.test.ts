import { selectWaterDetail, distanceToWater, WATER_BED, WATER_DETAIL_LOD, waterDepth } from '../../components/mesh/water/shading';
import type { TileConfig } from '../../types';
import { createShoreField, rebuildShoreField, SHORE_DISTANCE_RANGE, ShoreField, type ShoreFieldSource } from '../shoreField';

/** A 7 × 7 grid of 4 m tiles centered on `offset`, water in the middle 3 × 3 unless `island`. */
function source(offset: number, { island = false } = {}): ShoreFieldSource {
  const tiles: TileConfig[] = [];
  const range = island ? [-1, 0, 1] : [-3, -2, -1, 0, 1, 2, 3];
  for (const i of range) {
    for (const j of range) {
      const pond = !island && Math.abs(i) <= 1 && Math.abs(j) <= 1;
      tiles.push({
        id: `${i}:${j}`,
        tileGroupId: 'ground',
        position: { x: offset + i * 4, y: 0, z: offset + j * 4 },
        ...(pond ? { objectType: 'water' as const } : {}),
      });
    }
  }
  return { tileGroups: [{ tiles }], worldSurface: island ? 'water' : 'ground' };
}

test('coverage is 1 on open water, 0 on land and a half on the shoreline', () => {
  const field = createShoreField(source(0));
  expect(field.hasWater).toBe(true);
  expect(field.sample(0, 0)).toBeCloseTo(1, 2);
  expect(field.sample(12, 12)).toBeCloseTo(0, 2);
  // Snapped tiles sit on multiples of 4 m, so the pond ends at ±6 m.
  expect(field.sample(6, 0)).toBeCloseTo(0.5, 1);
  expect(field.sample(-6, 0)).toBeCloseTo(0.5, 1);
});

test('the shoreline meets tiles laid off the snapping grid', () => {
  const field = createShoreField(source(2));
  expect(field.sample(8, 2)).toBeCloseTo(0.5, 1);
  expect(field.sample(-4, 2)).toBeCloseTo(0.5, 1);
  expect(field.sample(2, 2)).toBeCloseTo(1, 2);
});

test('an island in a water world is surrounded by open sea', () => {
  const field = createShoreField(source(0, { island: true }));
  expect(field.hasWater).toBe(true);
  expect(field.sample(0, 0)).toBeCloseTo(0, 2);
  expect(field.sample(6, 0)).toBeCloseTo(0.5, 1);
  expect(field.sample(40, 0)).toBeCloseTo(1, 2);
  expect(createShoreField({ tileGroups: [], worldSurface: 'ground' }).hasWater).toBe(false);
});

test('a rebuild spread over steps keeps the old field until it lands the same texture', () => {
  const field = new ShoreField();
  const steps = rebuildShoreField(field, source(0), { texelsPerCell: 16 });
  let yields = 0;
  while (!steps.next().done) {
    yields++;
    expect(field.version).toBe(0);
  }
  expect(yields).toBeGreaterThan(0);
  expect(field.version).toBe(1);
  const once = createShoreField(source(0), { texelsPerCell: 16 });
  expect(Array.from((field.texture.image as { data: Uint8Array }).data)).toEqual(Array.from((once.texture.image as { data: Uint8Array }).data));
});

test('water detail switches with hysteresis around the camera distance', () => {
  const between = (WATER_DETAIL_LOD.enter + WATER_DETAIL_LOD.exit) / 2;
  expect(selectWaterDetail(true, between)).toBe(true);
  expect(selectWaterDetail(false, between)).toBe(false);
  expect(selectWaterDetail(false, WATER_DETAIL_LOD.enter - 1)).toBe(true);
  expect(selectWaterDetail(true, WATER_DETAIL_LOD.exit + 1)).toBe(false);
  expect(distanceToWater(3, 5, 1, 0, 0, 0, 4, 4)).toBe(5);
  expect(distanceToWater(7, 0, 0, 0, 0, 0, 4, 4)).toBe(3);
});

test('the distance to land grows from the shoreline into open water', () => {
  const meters = (field: ShoreField, x: number, z: number) => field.sample(x, z, 1) * SHORE_DISTANCE_RANGE;
  const pond = createShoreField(source(0));
  expect(meters(pond, 12, 12)).toBe(0);
  // The pond spans ±6 m: its middle lies 6 m from its banks, give or take a texel.
  expect(meters(pond, 0, 0)).toBeGreaterThan(5);
  expect(meters(pond, 0, 0)).toBeLessThan(7);
  expect(meters(pond, 4, 0)).toBeCloseTo(2, 0);
  const island = createShoreField(source(0, { island: true }));
  expect(meters(island, 0, 0)).toBe(0);
  expect(meters(island, 10, 0)).toBeCloseTo(4, 0);
  expect(meters(island, 10, 0)).toBeLessThan(meters(island, 12, 0));
});

test('water reads deeper away from land: a shelving sea with a floor, a pond that levels off', () => {
  const { sea, pond } = WATER_BED;
  expect(waterDepth(0, true)).toBeCloseTo(sea.shore);
  expect(waterDepth(-3, true)).toBeCloseTo(sea.shore);
  expect(waterDepth(10, true)).toBeGreaterThan(waterDepth(5, true));
  expect(waterDepth(1_000, true)).toBe(sea.max);
  expect(waterDepth(0, false)).toBe(0);
  expect(waterDepth(pond.ramp / 2, false)).toBeCloseTo(pond.depth / 2);
  expect(waterDepth(pond.ramp * 4, false)).toBe(pond.depth);
});
