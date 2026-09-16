import { createSceneDocumentController } from 'gaesup-world';

import { createMinihome, makeFurniture, MAX_FURNITURE, parseMinihome } from '../model';

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
  expect(home.room.objects).toHaveLength(6);
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
