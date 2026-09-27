import type { MeshConfig, PlacedObject, TileConfig, TileGroupConfig } from '../../types';
import { scatterDecor } from '../scatter';

const tile = (x: number, z: number, objectType?: TileConfig['objectType']): TileConfig => ({
  id: `${x}:${z}`, tileGroupId: 'ground', size: 1, position: { x, y: 0, z }, ...(objectType ? { objectType } : {}),
});

/** A dirt road along z = 0 through a lawn of 4 m tiles, three rows deep. */
function world(): TileGroupConfig[] {
  const tiles: TileConfig[] = [];
  for (let x = -8; x <= 8; x += 4) for (const z of [-4, 0, 4]) tiles.push(tile(x, z, z === 0 ? 'dirt' : undefined));
  return [{ id: 'ground', name: 'ground', floorMeshId: 'lawn', tiles }];
}

const roadside = (extra: Partial<NonNullable<MeshConfig['scatter']>[number]> = {}): Map<string, MeshConfig> => new Map([
  ['lawn', { id: 'lawn', scatter: [{ models: ['nature-flower-red', 'nature-rock-small'], density: 3, near: 'dirt', margin: 0.3, within: 1.5, ...extra }] }],
]);

test('roadside decoration keeps to the band beside the road and never lands on it', () => {
  const decor = scatterDecor(world(), roadside());
  expect(decor.length).toBeGreaterThan(20);
  for (const object of decor) {
    // The road spans z in [-2, 2]; the band runs 0.3 to 1.5 m out from its edges.
    const out = Math.abs(object.position.z) - 2;
    expect(out).toBeGreaterThanOrEqual(0.3 - 1e-9);
    expect(out).toBeLessThanOrEqual(1.5 + 1e-9);
    expect(['nature-flower-red', 'nature-rock-small']).toContain(object.config?.modelId);
  }
});

test('the same tiles scatter the same decoration, and a rebuild keeps equal pieces as they were', () => {
  const a = scatterDecor(world(), roadside());
  const b = scatterDecor(world(), roadside());
  expect(b).toEqual(a);
  const previous = new Map(a.map((object) => [object.id, object]));
  const again = scatterDecor(world(), roadside(), [], previous);
  expect(again.every((object, index) => object === a[index])).toBe(true);
  expect(scatterDecor(world(), roadside({ seed: 1 }))).not.toEqual(a);
});

test('placed objects keep decoration clear and patches thin it', () => {
  const all = scatterDecor(world(), roadside());
  const target = all[0]!;
  const tree: PlacedObject = { id: 'tree', type: 'model', position: { ...target.position } };
  const cleared = scatterDecor(world(), roadside(), [tree]);
  expect(cleared.some((object) => Math.hypot(object.position.x - tree.position.x, object.position.z - tree.position.z) < 1.2)).toBe(false);
  expect(scatterDecor(world(), roadside({ clump: 1 })).length).toBeLessThan(all.length);
});

test('a rule without a cover spreads over the whole tile, and covered tiles get none', () => {
  const meshes = new Map<string, MeshConfig>([['lawn', { id: 'lawn', scatter: [{ models: ['nature-mushroom-cluster'], density: 1 }] }]]);
  const decor = scatterDecor(world(), meshes);
  // 10 lawn tiles of 16 m² at one candidate a square meter.
  expect(decor.length).toBe(160);
  expect(decor.some((object) => Math.abs(object.position.z) < 2)).toBe(false);
});
