import {
  SCENE_COMPONENT_TYPES,
  createColliderComponent,
  createInteractableComponent,
  createMeshRendererComponent,
  createRigidBodyComponent,
  createSceneMigrationRegistry,
  findSceneObject,
  findSceneObjectsByLayer,
  findSceneObjectsByTag,
  findSceneObjectsWithComponent,
  getSceneObjectComponent,
  isCanonicalSceneJsonObject,
  loadSceneRuntime,
  migrateSceneDocument,
  parseSceneDocument,
  serializeSceneDocument,
  type SceneComponent,
} from '..';
import {
  createSceneComponent,
  createSceneDocument,
  createSceneObject,
  getSceneChildren,
  validateSceneDocument,
} from '../core';

describe('scene object model', () => {
  test('creates serializable scene objects with default transform values', () => {
    const object = createSceneObject({
      id: 'player',
      name: 'Player',
      components: [{ id: 'controller', type: 'gaesup.controller', data: { speed: 4 } }],
      tags: ['player'],
      layer: 'actors',
    });

    expect(object).toEqual({
      id: 'player',
      name: 'Player',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      components: [
        {
          id: 'controller',
          type: 'gaesup.controller',
          enabled: true,
          data: { speed: 4 },
        },
      ],
      tags: ['player'],
      layer: 'actors',
    });
    expect(JSON.parse(JSON.stringify(object))).toEqual(object);
  });

  test('validates duplicate ids, missing parents, and parent cycles', () => {
    const document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'a', parentId: 'b' },
        { id: 'b', parentId: 'a' },
        { id: 'a' },
        { id: 'orphan', parentId: 'missing' },
        {
          id: 'dupe-component',
          components: [
            { id: 'same', type: 'one' },
            { id: 'same', type: 'two' },
          ],
        },
      ],
    });

    const result = validateSceneDocument(document);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'duplicate-object-id',
        'duplicate-component-id',
        'missing-parent',
        'parent-cycle',
      ]),
    );
  });

  test('queries direct scene children', () => {
    const document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'root' },
        { id: 'child-a', parentId: 'root' },
        { id: 'child-b', parentId: 'root' },
        { id: 'grandchild', parentId: 'child-a' },
      ],
    });

    expect(getSceneChildren(document, 'root').map((object) => object.id)).toEqual([
      'child-a',
      'child-b',
    ]);
    expect(getSceneChildren(document, undefined).map((object) => object.id)).toEqual(['root']);
  });

  test('creates standard authoring components', () => {
    const object = createSceneObject({
      id: 'crate',
      components: [
        createMeshRendererComponent({ assetId: 'crate.glb', castShadow: true }),
        createColliderComponent({ shape: 'box', size: [1, 1, 1] }),
        createRigidBodyComponent({ type: 'fixed' }),
        createInteractableComponent({ kind: 'pickup', prompt: 'Pick up', radius: 2 }),
      ],
    });

    expect(object.components.map((component) => component.type)).toEqual([
      SCENE_COMPONENT_TYPES.meshRenderer,
      SCENE_COMPONENT_TYPES.collider,
      SCENE_COMPONENT_TYPES.rigidBody,
      SCENE_COMPONENT_TYPES.interactable,
    ]);
    expect(JSON.parse(JSON.stringify(object))).toEqual(object);
  });

  test('rejects values that cannot round-trip through canonical JSON', () => {
    const symbolKey = Symbol('invalid');
    const sparseValues = ['value'];
    delete sparseValues[0];
    let accessorCalls = 0;
    const accessorValues: string[] = [];
    Object.defineProperty(accessorValues, '0', {
      configurable: true,
      enumerable: true,
      get: () => {
        accessorCalls++;
        return 'value';
      },
    });
    accessorValues.length = 1;
    class JsonArray extends Array<string> {
      toJSON() {
        return { replaced: true };
      }
    }
    const cyclicValue: Record<string, unknown> = {};
    cyclicValue.self = cyclicValue;

    expect(() => createMeshRendererComponent({ invalid: undefined })).toThrow(TypeError);
    expect(() => createMeshRendererComponent({ [symbolKey]: 'value' })).toThrow(TypeError);
    expect(() => createMeshRendererComponent({ invalid: Number.NaN })).toThrow(TypeError);
    expect(() => createMeshRendererComponent({ invalid: Number.POSITIVE_INFINITY })).toThrow(
      TypeError,
    );
    expect(() => createMeshRendererComponent({ invalid: -0 })).toThrow(TypeError);
    expect(() => createMeshRendererComponent({ values: sparseValues })).toThrow(TypeError);
    expect(() => createMeshRendererComponent({ values: accessorValues })).toThrow(TypeError);
    expect(accessorCalls).toBe(0);
    expect(() => createMeshRendererComponent({ values: new JsonArray('value') })).toThrow(
      TypeError,
    );
    expect(() =>
      createMeshRendererComponent({ cyclicValue } as unknown as Parameters<
        typeof createMeshRendererComponent
      >[0]),
    ).toThrow(TypeError);
    expect(() =>
      createMeshRendererComponent({ invalid: new Date() } as unknown as Parameters<
        typeof createMeshRendererComponent
      >[0]),
    ).toThrow(TypeError);
  });

  test('accepts repeated plain JSON references without treating them as cycles', () => {
    const shared = { count: 1 };
    const component = createMeshRendererComponent({ left: shared, right: shared });

    expect(isCanonicalSceneJsonObject(component.data)).toBe(true);
    expect(component.data.left).not.toBe(shared);
    expect(component.data.left).toBe(component.data.right);
    expect(Object.isFrozen(component.data)).toBe(false);
    shared.count = 2;
    expect(component.data.left).toEqual({ count: 1 });
    component.data.assetId = 'owned-copy';
    expect(component.data.assetId).toBe('owned-copy');
  });

  test('materializes document arrays and component records as owned plain values', () => {
    class ObjectArray extends Array<{ id: string }> {
      toJSON() {
        return { replacedObjects: true };
      }
    }
    const objects = new ObjectArray({ id: 'object' });
    const document = createSceneDocument({ id: 'scene', objects });

    expect(Object.getPrototypeOf(document.objects)).toBe(Array.prototype);
    expect(JSON.parse(serializeSceneDocument(document)).objects).toEqual([
      expect.objectContaining({ id: 'object' }),
    ]);

    const component = createMeshRendererComponent({ assetId: 'mesh' });
    const componentWithToJSON = Object.assign(component, {
      toJSON: () => ({ replacedComponent: true }),
    });
    const object = createSceneObject({ components: [componentWithToJSON] });

    expect(object.components[0]).not.toHaveProperty('toJSON');
  });

  test('validates and refuses to serialize manually corrupted component data', () => {
    const document = createSceneDocument({
      id: 'invalid-data-scene',
      objects: [
        {
          id: 'object',
          components: [createMeshRendererComponent({ assetId: 'mesh' })],
        },
      ],
    });
    const component = document.objects[0]!.components[0]!;
    const corruptedDocument = {
      ...document,
      objects: [
        {
          ...document.objects[0]!,
          components: [
            {
              ...component,
              data: { invalid: undefined } as unknown as typeof component.data,
            },
          ],
        },
      ],
    };

    expect(validateSceneDocument(corruptedDocument).issues).toEqual([
      expect.objectContaining({ code: 'invalid-component-data', componentId: expect.any(String) }),
    ]);
    expect(loadSceneRuntime(corruptedDocument)).toEqual(
      expect.objectContaining({ ok: false, issues: expect.any(Array) }),
    );
    expect(() => serializeSceneDocument(corruptedDocument)).toThrow(TypeError);
  });

  test('refuses to serialize any invalid scene document', () => {
    const document = createSceneDocument({
      id: 'invalid-transform-scene',
      objects: [{ id: 'object', transform: { position: [Number.NaN, 0, 0] } }],
    });

    expect(validateSceneDocument(document).issues).toEqual([
      expect.objectContaining({ code: 'invalid-transform', objectId: 'object' }),
    ]);
    expect(() => serializeSceneDocument(document)).toThrow(TypeError);
  });

  test('reports non-canonical component data supplied to the parser', () => {
    const parsed = parseSceneDocument({
      version: 1,
      id: 'invalid-data-scene',
      objects: [
        {
          id: 'object',
          components: [
            {
              id: 'component',
              type: 'gaesup.test',
              enabled: true,
              data: { invalid: undefined },
            },
          ],
        },
      ],
    });

    expect(parsed.ok).toBe(false);
    expect(parsed.issues[0]?.code).toBe('invalid-component-data');
  });

  test('reports sparse document arrays instead of throwing from the parser', () => {
    const objects = Array<unknown>(1);
    const parsed = parseSceneDocument({ version: 1, id: 'sparse-scene', objects });

    expect(parsed.ok).toBe(false);
    expect(parsed.issues[0]?.code).toBe('invalid-document-shape');
  });

  test('reports root accessors without invoking them or throwing from the parser', () => {
    let getterCalls = 0;
    const input = { id: 'scene', objects: [] };
    Object.defineProperty(input, 'version', {
      enumerable: true,
      get: () => {
        getterCalls++;
        return 1;
      },
    });

    const parsed = parseSceneDocument(input);

    expect(parsed.ok).toBe(false);
    expect(parsed.issues[0]?.code).toBe('invalid-document-shape');
    expect(getterCalls).toBe(0);
  });

  test.each([
    { label: 'scalar object', objects: [42] },
    { label: 'missing object id', objects: [{}] },
    { label: 'null object', objects: [null] },
    { label: 'scalar component', objects: [{ id: 'object', components: [42] }] },
    { label: 'missing component fields', objects: [{ id: 'object', components: [{}] }] },
    {
      label: 'non-string component type',
      objects: [
        {
          id: 'object',
          components: [{ id: 'component', type: 42, enabled: true, data: {} }],
        },
      ],
    },
    {
      label: 'non-boolean component enabled',
      objects: [
        {
          id: 'object',
          components: [{ id: 'component', type: 'probe', enabled: 'yes', data: {} }],
        },
      ],
    },
  ])('rejects malformed persisted wrappers: $label', ({ objects }) => {
    const parsed = parseSceneDocument({ version: 1, id: 'malformed-scene', objects });

    expect(parsed.ok).toBe(false);
    expect(parsed.issues[0]?.code).toBe('invalid-document-shape');
  });

  test.each([
    { label: 'null', position: null },
    { label: 'zero', position: 0 },
    { label: 'false', position: false },
    { label: 'empty string', position: '' },
    { label: 'oversized tuple', position: [1, 2, 3, 4] },
    { label: 'array-like object', position: { 0: 1, 1: 2, 2: 3 } },
    { label: 'non-finite number', position: [Number.NaN, 0, 0] },
    { label: 'negative zero', position: [-0, 0, 0] },
  ])('rejects malformed persisted transforms: $label', ({ position }) => {
    const parsed = parseSceneDocument({
      version: 1,
      id: 'malformed-transform-scene',
      objects: [{ id: 'object', transform: { position } }],
    });

    expect(parsed.ok).toBe(false);
    expect(parsed.issues[0]?.code).toBe('invalid-transform');
  });

  test('rejects malformed component records at every persisted boundary', () => {
    const document = createSceneDocument({ id: 'scene', objects: [{ id: 'object' }] });
    document.objects[0]!.components.push({
      id: 'component',
      enabled: true,
      data: {},
    } as unknown as SceneComponent);

    expect(validateSceneDocument(document).issues).toEqual([
      expect.objectContaining({ code: 'invalid-document-shape', objectId: 'object' }),
    ]);
    expect(loadSceneRuntime(document).ok).toBe(false);
    expect(() => serializeSceneDocument(document)).toThrow(TypeError);
  });

  test('rejects invalid low-level component authoring fields', () => {
    expect(() => createSceneComponent({ type: '' })).toThrow(TypeError);
    expect(() =>
      createSceneComponent({ id: '', type: 'probe' } as Parameters<typeof createSceneComponent>[0]),
    ).toThrow(TypeError);
    expect(() =>
      createSceneComponent({ type: 'probe', enabled: 'yes' } as unknown as Parameters<
        typeof createSceneComponent
      >[0]),
    ).toThrow(TypeError);
    expect(() =>
      createSceneComponent({ type: 'probe', data: null } as unknown as Parameters<
        typeof createSceneComponent
      >[0]),
    ).toThrow(TypeError);
  });

  test('serializes and parses scene documents', () => {
    const document = createSceneDocument({
      id: 'scene',
      name: 'Demo Scene',
      objects: [
        { id: 'root' },
        { id: 'child', parentId: 'root', transform: { position: [1, 2, 3] } },
      ],
    });

    const serialized = serializeSceneDocument(document);
    const parsed = parseSceneDocument(serialized);

    expect(parsed.ok).toBe(true);
    expect(parsed.document).toEqual(document);
  });

  test('reports invalid serialized scene documents', () => {
    expect(parseSceneDocument('{bad json').ok).toBe(false);
    expect(
      parseSceneDocument({ version: 2, id: 'scene', objects: [] }).issues[0]?.message,
    ).toContain('version');
    expect(parseSceneDocument({ version: 1, id: '', objects: [] }).issues[0]?.message).toContain(
      'id',
    );
  });

  test('loads scene documents into a runtime hierarchy index', () => {
    const document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'root', transform: { position: [10, 0, 0], scale: [2, 2, 2] } },
        { id: 'child', parentId: 'root', transform: { position: [1, 2, 3], rotation: [0, 1, 0] } },
      ],
    });

    const loaded = loadSceneRuntime(document);

    expect(loaded.ok).toBe(true);
    expect(loaded.runtime?.roots.map((object) => object.id)).toEqual(['root']);
    expect(loaded.runtime?.getChildren('root').map((object) => object.id)).toEqual(['child']);
    expect(loaded.runtime?.getWorldTransform('child')).toEqual({
      position: [11, 2, 3],
      rotation: [0, 1, 0],
      scale: [2, 2, 2],
    });
  });

  test('loads runtime state from an owned canonical materialization', () => {
    const document = createSceneDocument({
      id: 'proxy-scene',
      objects: [
        {
          id: 'object',
          components: [createMeshRendererComponent({ assetId: 'mesh' })],
        },
      ],
    });
    const target = { assetId: 'descriptor-value' };
    const proxy = new Proxy(target, {
      get(currentTarget, property, receiver) {
        if (property === 'assetId') return undefined;
        return Reflect.get(currentTarget, property, receiver);
      },
    });
    const component = document.objects[0]!.components[0]!;
    component.data = proxy;

    const loaded = loadSceneRuntime(document);
    const loadedData = loaded.runtime?.document.objects[0]?.components[0]?.data;

    expect(loaded.ok).toBe(true);
    expect(loadedData).not.toBe(proxy);
    expect(loadedData).toEqual({ assetId: 'descriptor-value' });
  });

  test('queries scene runtime objects by tag, layer, and component', () => {
    const document = createSceneDocument({
      id: 'scene',
      objects: [
        {
          id: 'player',
          name: 'Player',
          tags: ['actor', 'player'],
          layer: 'actors',
          components: [
            createRigidBodyComponent({ type: 'dynamic' }),
            createInteractableComponent({ kind: 'talk', prompt: 'Talk' }),
          ],
        },
        {
          id: 'tree',
          tags: ['resource'],
          layer: 'environment',
          components: [
            createMeshRendererComponent({ assetId: 'tree.glb' }),
            createColliderComponent({ shape: 'box', size: [2, 4, 2] }),
          ],
        },
      ],
    });
    const runtime = loadSceneRuntime(document).runtime;

    expect(runtime).toBeDefined();
    expect(findSceneObjectsByTag(runtime!, 'actor').map((object) => object.id)).toEqual(['player']);
    expect(findSceneObjectsByLayer(runtime!, 'environment').map((object) => object.id)).toEqual([
      'tree',
    ]);
    expect(
      findSceneObjectsWithComponent(runtime!, SCENE_COMPONENT_TYPES.collider).map(
        (object) => object.id,
      ),
    ).toEqual(['tree']);
    expect(
      findSceneObject(runtime!, {
        tags: ['actor', 'player'],
        componentType: SCENE_COMPONENT_TYPES.rigidBody,
      })?.id,
    ).toBe('player');
    expect(
      getSceneObjectComponent(document.objects[1]!, SCENE_COMPONENT_TYPES.meshRenderer)?.data,
    ).toEqual({
      assetId: 'tree.glb',
    });
  });

  test('migrates older scene documents before validation', () => {
    const registry = createSceneMigrationRegistry([
      {
        fromVersion: 0,
        toVersion: 1,
        description: 'Promote legacy root object shape',
        migrate(document) {
          const legacyObjects = Array.isArray(document.nodes) ? document.nodes : [];
          return {
            id: typeof document.id === 'string' ? document.id : 'legacy-scene',
            objects: legacyObjects.map((node) =>
              node && typeof node === 'object'
                ? { id: (node as { id?: unknown }).id, name: (node as { label?: unknown }).label }
                : {},
            ),
          };
        },
      },
    ]);

    const migrated = registry.migrate({
      version: 0,
      id: 'legacy',
      nodes: [{ id: 'root', label: 'Root' }],
    });

    expect(migrated.ok).toBe(true);
    expect(migrated.steps).toEqual([
      { fromVersion: 0, toVersion: 1, description: 'Promote legacy root object shape' },
    ]);
    expect(migrated.document).toEqual(
      createSceneDocument({
        id: 'legacy',
        objects: [{ id: 'root', name: 'Root' }],
      }),
    );
  });

  test('reports unsupported scene migrations', () => {
    const migrated = migrateSceneDocument({ version: 0, id: 'legacy', objects: [] });

    expect(migrated.ok).toBe(false);
    expect(migrated.issues[0]?.code).toBe('unsupported-scene-version');
  });
});
