import {
  SCENE_DOCUMENT_SAVE_KEY,
  createSceneDocument,
  createSceneDocumentController,
  createSceneDocumentSaveBinding,
} from '..';
import type { SceneDocument, SceneMigration } from '..';
import { SaveSystem } from '../../save';
import type { SaveAdapter } from '../../save';

const adapter: SaveAdapter = {
  read: async () => null,
  write: async () => undefined,
  list: async () => [],
  remove: async () => undefined,
};

describe('createSceneDocumentSaveBinding', () => {
  test('uses the isolated scene-document key and serializes a mutable owned clone', () => {
    const controller = createSceneDocumentController(
      createSceneDocument({
        id: 'scene',
        objects: [{ id: 'root', name: 'Root', tags: ['initial'] }],
      }),
    );
    const binding = createSceneDocumentSaveBinding(controller);

    const serialized = binding.serialize() as SceneDocument;

    expect(binding.key).toBe(SCENE_DOCUMENT_SAVE_KEY);
    expect(binding.key).toBe('scene-document');
    expect(serialized).not.toBe(controller.getSnapshot());
    expect(Object.isFrozen(serialized)).toBe(false);
    expect(Object.isFrozen(serialized.objects)).toBe(false);
    serialized.objects[0]?.tags.push('serialized-mutation');
    serialized.objects.push({
      id: 'serialized-only',
      name: 'Serialized only',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      components: [],
      tags: [],
    });
    expect(controller.getSnapshot().objects).toHaveLength(1);
    expect(controller.getSnapshot().objects[0]?.tags).toEqual(['initial']);
  });

  test('hydrates through migration and the canonical replace command', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const events: string[] = [];
    controller.subscribe((_snapshot, event) => events.push(event.type));
    const migration: SceneMigration = {
      fromVersion: 0,
      toVersion: 1,
      migrate: (document) => ({ ...document, name: 'Migrated', objects: [] }),
    };
    const binding = createSceneDocumentSaveBinding(controller, [migration]);

    binding.hydrate({ version: 0, id: 'legacy', objects: [] });

    expect(controller.getSnapshot()).toMatchObject({
      version: 1,
      id: 'legacy',
      name: 'Migrated',
      objects: [],
    });
    expect(events).toEqual(['scene-document.replaced']);
  });

  test('treats nullish hydration as a no-op and throws on invalid data without changing state', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const binding = createSceneDocumentSaveBinding(controller);
    const before = controller.getSnapshot();
    const listener = jest.fn();
    controller.subscribe(listener);

    binding.hydrate(null);
    binding.hydrate(undefined);
    expect(controller.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();

    expect(() => binding.hydrate({ version: 1, id: '', objects: [] })).toThrow(TypeError);
    expect(controller.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  test('lets SaveSystem observe invalid hydrate diagnostics while preserving exact state identity', () => {
    const diagnostic = jest.fn();
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const before = controller.getSnapshot();
    const saveSystem = new SaveSystem({ adapter, onDiagnostic: diagnostic });
    saveSystem.register(createSceneDocumentSaveBinding(controller));

    saveSystem.hydrateBlob(
      {
        version: 1,
        savedAt: 1,
        domains: {
          'scene-document': { version: 1, id: 'invalid', objects: 'not-an-array' },
        },
      },
      'diagnostic-slot',
    );

    expect(controller.getSnapshot()).toBe(before);
    expect(diagnostic).toHaveBeenCalledTimes(1);
    expect(diagnostic).toHaveBeenCalledWith({
      phase: 'hydrate',
      key: 'scene-document',
      slot: 'diagnostic-slot',
      error: expect.any(TypeError),
    });
  });
});
