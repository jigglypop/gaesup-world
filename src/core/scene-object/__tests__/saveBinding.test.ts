import {
  SCENE_DOCUMENT_SAVE_KEY,
  createSceneDocument,
  createSceneDocumentController,
  createSceneDocumentSaveBinding,
} from '..';
import type { SceneDocument, SceneMigration } from '..';
import { SaveSystem } from '../../save';
import type { SaveAdapter } from '../../save';
import * as core from '../core';

const adapter: SaveAdapter = {
  read: async () => null,
  write: async () => undefined,
  list: async () => [],
  remove: async () => undefined,
};

describe('createSceneDocumentSaveBinding', () => {
  test('prepares migrations without changing state and applies only after all domains prepare', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const before = controller.getSnapshot();
    const migrate = jest.fn((document: Parameters<SceneMigration['migrate']>[0]) => ({ ...document, objects: [] }));
    const binding = createSceneDocumentSaveBinding(controller, [{ fromVersion: 0, toVersion: 1, migrate }]);
    const apply = binding.prepareHydrate!({ version: 0, id: 'loaded', objects: [] });
    expect(controller.getSnapshot()).toBe(before);
    expect(migrate).toHaveBeenCalledTimes(1);
    apply();
    expect(controller.getSnapshot().id).toBe('loaded');
    expect(migrate).toHaveBeenCalledTimes(1);
  });

  test('a corrupt scene prevents earlier legacy and prepared domains from being applied', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const saveSystem = new SaveSystem({ adapter });
    const hydrate = jest.fn();
    const apply = jest.fn();
    saveSystem.register({ key: 'legacy', serialize: () => null, hydrate });
    saveSystem.register({ key: 'prepared', serialize: () => null, hydrate, prepareHydrate: () => apply });
    saveSystem.register(createSceneDocumentSaveBinding(controller));
    expect(() => saveSystem.hydrateBlob({ version: 1, savedAt: 1, domains: {
      'scene-document': { version: 1, id: '', objects: [] },
    } })).toThrow('Save hydration failed');
    expect(hydrate).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
    expect(controller.getSnapshot().id).toBe('current');
    saveSystem.hydrateBlob({ version: 1, savedAt: 1, domains: {
      'scene-document': createSceneDocument({ id: 'loaded' }),
    } });
    expect(hydrate).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot().id).toBe('loaded');
  });

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

  test('serializes a trusted snapshot with one copy, no validation and a stable revision', () => {
    const controller = createSceneDocumentController(
      createSceneDocument({ id: 'scene', objects: [{ id: 'root', name: 'Root' }] }),
    );
    controller.dispatch({ type: 'scene-object.update', objectId: 'root', patch: { name: 'Edited' } });
    const binding = createSceneDocumentSaveBinding(controller);
    const validate = jest.spyOn(core, 'validateSceneDocument');
    try {
      expect(binding.owned).toBe(true);
      expect(binding.serialize()).toEqual(controller.getSnapshot());
      expect(validate).not.toHaveBeenCalled();
      const revision = binding.revision!();
      expect(binding.revision!()).toBe(revision);
      controller.dispatch({ type: 'scene-object.update', objectId: 'root', patch: { name: 'Again' } });
      expect(binding.revision!()).toBe(revision + 1);
    } finally {
      validate.mockRestore();
    }
  });

  test('validates an untrusted controller snapshot on save and always reads it as changed', () => {
    const snapshot = createSceneDocument({ id: 'custom', objects: [{ id: 'root' }] });
    const binding = createSceneDocumentSaveBinding({ getSnapshot: () => snapshot, dispatch: jest.fn() });
    const validate = jest.spyOn(core, 'validateSceneDocument');
    try {
      expect(binding.serialize()).toEqual(snapshot);
      expect(validate).toHaveBeenCalled();
      expect(binding.revision!()).not.toBe(binding.revision!());
    } finally {
      validate.mockRestore();
    }
  });

  test('hydration validates the migrated document once', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const binding = createSceneDocumentSaveBinding(controller);
    const validate = jest.spyOn(core, 'validateSceneDocument');
    try {
      binding.hydrate(createSceneDocument({ id: 'loaded', objects: [{ id: 'a' }, { id: 'b', parentId: 'a' }] }));
      expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['a', 'b']);
      expect(validate).toHaveBeenCalledTimes(1);
    } finally {
      validate.mockRestore();
    }
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

    expect(() => saveSystem.hydrateBlob(
      {
        version: 1,
        savedAt: 1,
        domains: {
          'scene-document': { version: 1, id: 'invalid', objects: 'not-an-array' },
        },
      },
      'diagnostic-slot',
    )).toThrow('Save hydration failed');

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
