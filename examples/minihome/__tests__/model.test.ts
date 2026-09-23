import { createSceneDocumentController } from 'gaesup-world';

import { BACKUP_KEY, createMinihome, loadMinihome, makeFurniture, MAX_FURNITURE, parseMinihome, saveMinihome, STORAGE_KEY } from '../model';

test('canonical furniture edits survive serialization without renderer objects', () => {
  const home = createMinihome();
  const controller = createSceneDocumentController(home.room);
  const added = makeFurniture('plant', 1, 2, 'plant-test');
  controller.dispatch({ type: 'scene-object.create', object: added });
  controller.dispatch({
    type: 'scene-object.update',
    objectId: added.id,
    patch: { transform: { position: [2, 0, 1] } },
  });
  const parsed = parseMinihome(JSON.stringify({ ...home, room: controller.getSnapshot() }));
  expect(parsed?.room.objects.find((object) => object.id === added.id)?.transform.position).toEqual(
    [2, 0, 1],
  );
  expect(home.room.objects.some(object => object.id === added.id)).toBe(false);
});

test('migrates old room settings and preserves only supported values in backups', () => {
  const home = createMinihome();
  const legacy = { ...home, roomSettings: undefined };
  expect(parseMinihome(JSON.stringify(legacy))?.roomSettings).toEqual(home.roomSettings);
  home.roomSettings = { ...home.roomSettings, quality: 'economy', lighting: 'evening', camera: 'front', avatar: 'blue' };
  expect(parseMinihome(JSON.stringify(home))?.roomSettings).toEqual(home.roomSettings);
  for (const roomSettings of [null, {}, { ...home.roomSettings, quality: 'ultra' }, { ...home.roomSettings, camera: 'free' }]) {
    expect(parseMinihome(JSON.stringify({ ...home, roomSettings }))).toBeNull();
  }
});

test('backup recovery preserves corrupt primary and saving rejects concurrent tab changes', () => {
  localStorage.clear();
  const first = JSON.stringify(createMinihome());
  saveMinihome(first, null);
  const second = JSON.stringify({ ...createMinihome(), theme: 'sage' });
  saveMinihome(second, first);
  expect(localStorage.getItem(BACKUP_KEY)).toBe(first);
  expect(() => saveMinihome(first, first)).toThrow('다른 탭');
  localStorage.setItem(STORAGE_KEY, '{broken');
  const restored = loadMinihome();
  expect(restored.data).toEqual(JSON.parse(first));
  expect(restored.autoSave).toBe(false);
  expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  localStorage.clear();
});

test('rejects invalid dates and excessive authors and drops unknown profile fields', () => {
  const home = createMinihome();
  home.diary = [{ id: 'note', author: 'A', text: 'hello', date: 'invalid' }];
  expect(parseMinihome(JSON.stringify(home))).toBeNull();
  home.diary[0]!.date = new Date().toISOString();
  home.diary[0]!.author = 'a'.repeat(201);
  expect(parseMinihome(JSON.stringify(home))).toBeNull();
});

test('rejects corrupted, unknown-version, oversized and out-of-room saved data', () => {
  expect(parseMinihome('{bad')).toBeNull();
  expect(parseMinihome(JSON.stringify({ ...createMinihome(), version: 2 }))).toBeNull();
  const home = createMinihome();
  home.room.objects.push(makeFurniture('plant', 100, 0, 'out-of-room'));
  expect(parseMinihome(JSON.stringify(home))).toBeNull();
  expect(parseMinihome(JSON.stringify({ ...createMinihome(), diary: [{ text: 'x' }] }))).toBeNull();
  const crowded = createMinihome();
  crowded.room.objects = Array.from({ length: MAX_FURNITURE + 1 }, (_, i) =>
    makeFurniture('plant', 0, 0, `plant-${i}`),
  );
  expect(parseMinihome(JSON.stringify(crowded))).toBeNull();
});
