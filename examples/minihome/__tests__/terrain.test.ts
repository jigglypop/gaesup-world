import { createMinihome, parseMinihome } from '../model';
import { createMinihomeSession } from '../session';
import { brushIndices, createTerrain, paintTiles, tileAt, tileIndex, tilePosition, WORLD_SIZE } from '../terrain';

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
