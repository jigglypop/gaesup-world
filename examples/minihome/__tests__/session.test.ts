import { createMinihome, makeFurniture } from '../model';
import { adoptSharedMinihome, createMinihomeSession } from '../session';

test('adopting a shared room preserves private notes and undo restores the recipient home', () => {
  const local = createMinihome();
  local.diary = [{ id: 'private', author: 'Me', text: 'Keep this', date: '2026-09-19T00:00:00.000Z' }];
  local.guestbook = [{ ...local.diary[0]!, id: 'guest' }];
  const shared = createMinihome();
  shared.profile.name = 'Visitor';
  shared.room.objects = [];
  const session = adoptSharedMinihome(local, shared);
  expect(session.getSnapshot().data).toEqual({ ...local, profile: shared.profile, room: shared.room });
  session.undo();
  expect(session.getSnapshot().data).toEqual(local);
  expect(session.getSnapshot().canUndo).toBe(false);
  session.redo();
  expect(session.getSnapshot().data.diary).toEqual(local.diary);
  expect(session.getSnapshot().data.guestbook).toEqual(local.guestbook);
});

test('mixed profile, furniture and theme changes undo and redo through one session', () => {
  const session = createMinihomeSession(createMinihome());
  const initial = session.getSnapshot().data;
  session.update((home) => ({ ...home, profile: { ...home.profile, name: 'Acorn' } }));
  session.controller.dispatch({ type: 'scene-object.create', object: makeFurniture('plant', 0, 0, 'extra') });
  session.update((home) => ({ ...home, theme: 'sage' }));
  const edited = session.getSnapshot().data;
  session.undo(); session.undo(); session.undo();
  expect(session.getSnapshot().data).toEqual(initial);
  expect(session.controller.getSnapshot()).toEqual(initial.room);
  session.redo(); session.redo(); session.redo();
  expect(session.getSnapshot().data).toEqual(edited);
  session.undo();
  session.update((home) => ({ ...home, theme: 'lavender' }));
  expect(session.getSnapshot().canRedo).toBe(false);
  session.dispose();
});

test('import replaces the room without replacing its controller; invalid data leaves state intact', () => {
  const session = createMinihomeSession(createMinihome());
  const controller = session.controller;
  const imported = createMinihome(); imported.room.objects = [];
  session.update(imported);
  expect(controller.getSnapshot().objects).toHaveLength(0);
  expect(session.controller).toBe(controller);
  const before = session.getSnapshot();
  expect(() => session.update({ ...imported, version: 2 } as unknown as typeof imported)).toThrow();
  expect(session.getSnapshot()).toBe(before);
  session.undo();
  expect(controller.getSnapshot().objects).toHaveLength(6);
});
