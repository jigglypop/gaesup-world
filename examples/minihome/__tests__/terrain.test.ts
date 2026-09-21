import { createMinihome, parseMinihome } from '../model';
import { createMinihomeSession } from '../session';
import { NavigationSystem } from 'gaesup-world/navigation';

import { brushIndices, createTerrain, expandTerrain, isTerrain, MAX_WORLD_SIZE, paintTiles, sculptTerrain, terrainHeight, terraceTerrain, tileAt, tileIndex, tilePosition, WORLD_SIZE } from '../terrain';

test('terrain coordinates are bounded, brushes clip at edges and all six materials are available', () => {
  const terrain = createTerrain();
  expect(new Set(terrain.tiles)).toEqual(new Set(['grass', 'snow', 'sand', 'water', 'stone', 'wood']));
  expect(tileIndex(-12, -12)).toBe(0); expect(tileIndex(12, 0)).toBe(-1); expect(tileIndex(0, -12.01)).toBe(-1);
  expect(brushIndices(0, 3)).toHaveLength(4); expect(brushIndices(-1, 5)).toEqual([]);
  for (let index = 0; index < WORLD_SIZE ** 2; index++) { const [x, , z] = tilePosition(index); expect(tileIndex(x, z)).toBe(index); }
  expect(tileAt(terrain, 10, 7)).toBe('water');
});

test('terrain stroke is one history entry, preserves furniture, and round trips through save migration', () => {
  const home = createMinihome(); const session = createMinihomeSession(home);
  const cells = brushIndices(tileIndex(0.5, 5.5), 3);
  session.update(previous => ({ ...previous, terrain: paintTiles(previous.terrain, cells, 'snow') }));
  expect(session.getSnapshot().data.terrain.tiles.filter((tile, index) => tile !== home.terrain.tiles[index])).toHaveLength(9);
  const saved = JSON.stringify(session.getSnapshot().data); expect(parseMinihome(saved)).toEqual(session.getSnapshot().data);
  session.undo(); expect(session.getSnapshot().data).toEqual(home); expect(session.getSnapshot().canUndo).toBe(false);
  session.redo(); expect(JSON.stringify(session.getSnapshot().data)).toBe(saved);
  const legacy = { ...home, terrain: undefined, roomSettings: { quality: 'balanced', camera: 'front', lighting: 'day' } };
  expect(parseMinihome(JSON.stringify(legacy))?.terrain).toEqual(createTerrain());
  for (const terrain of [null, { size: 24, tiles: [] }, { size: 24, tiles: Array(576).fill('lava') }]) expect(parseMinihome(JSON.stringify({ ...home, terrain }))).toBeNull();
  expect(parseMinihome(JSON.stringify({ ...home, roomSettings: { ...home.roomSettings, bloomStrength: 100 } }))).toBeNull();
  session.dispose();
});

test('stairs climb a terrace while isolated cliffs remain unreachable, and elevation survives save/expand/undo', async () => {
  const terrain = terraceTerrain(createTerrain());
  const nav = new NavigationSystem({ cellSize: 0.25, maxStepHeight: 0.18, worldMinX: -12, worldMaxX: 12, worldMinZ: -12, worldMaxZ: 12 });
  await nav.init();
  nav.setHeightSampler(0, 0, 24, 24, (x, z) => terrainHeight(terrain, x, z));
  const stairs = nav.findPath(-6.5, -1.5, -6.5, -4.5);
  expect(stairs.length).toBeGreaterThan(0); expect(stairs.at(-1)![1]).toBe(0.5);
  expect(nav.canTraverseSegment(-4.5, -2.5, -4.5, -4.5)).toBe(false);
  const raised = sculptTerrain(terrain, [tileIndex(2.5, 6.5)], { height: 2, stair: null });
  nav.setHeightSampler(0, 0, 24, 24, (x, z) => terrainHeight(raised, x, z));
  expect(nav.findPath(2.5, 4.5, 2.5, 6.5)).toEqual([]);
  const home = createMinihome(); const session = createMinihomeSession(home);
  session.update({ ...home, terrain: raised });
  expect(parseMinihome(JSON.stringify(session.getSnapshot().data))?.terrain).toEqual(raised);
  expect(terrainHeight(expandTerrain(raised), 2.5, 6.5)).toBe(2);
  session.undo(); expect(session.getSnapshot().data.terrain).toEqual(home.terrain);
  session.redo(); expect(session.getSnapshot().data.terrain).toEqual(raised);
  for (const heights of [[0], Array(576).fill(NaN), Array(576).fill(100)]) expect(isTerrain({ ...terrain, heights })).toBe(false);
  nav.dispose(); session.dispose();
});

test('expansion preserves world coordinates, old saves and furniture beyond the original boundary', () => {
  const home = createMinihome(); const session = createMinihomeSession(home);
  session.update(previous => ({ ...previous, terrain: expandTerrain(previous.terrain) }));
  const expanded = session.getSnapshot().data;
  expect(expanded.terrain.size).toBe(32);
  for (let index = 0; index < home.terrain.tiles.length; index++) {
    const [x, , z] = tilePosition(index);
    expect(tileAt(expanded.terrain, x, z)).toBe(home.terrain.tiles[index]);
  }
  expect(tileAt(expanded.terrain, 15.5, 15.5)).toBe('grass');
  expect(brushIndices(tileIndex(15.5, 15.5, 32), 5, 32)).toHaveLength(9);
  expect(expanded.room).toEqual(home.room);
  session.undo(); expect(session.getSnapshot().data.terrain).toEqual(home.terrain);
  session.redo(); expect(session.getSnapshot().data.terrain).toEqual(expanded.terrain);
  const saved = JSON.parse(JSON.stringify(expanded)) as typeof expanded; saved.room.objects[0]!.transform.position = [15, 0, 15];
  expect(parseMinihome(JSON.stringify(saved))?.room.objects[0]!.transform.position).toEqual([15, 0, 15]);
  expect(parseMinihome(JSON.stringify({ ...saved, terrain: home.terrain }))).toBeNull();
  let largest = expanded.terrain;
  while (largest.size < MAX_WORLD_SIZE) largest = expandTerrain(largest);
  expect(expandTerrain(largest)).toBe(largest); expect(isTerrain(largest)).toBe(true);
  expect(isTerrain({ size: 100000, tiles: [] })).toBe(false);
  expect(tileIndex(NaN, 0, 32)).toBe(-1);
  session.dispose();
});
