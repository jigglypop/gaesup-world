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
  loadSceneRuntime,
  migrateSceneDocument,
  parseSceneDocument,
  serializeSceneDocument,
} from '..';
import {
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
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'duplicate-object-id',
      'duplicate-component-id',
      'missing-parent',
      'parent-cycle',
    ]));
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

    expect(getSceneChildren(document, 'root').map((object) => object.id)).toEqual(['child-a', 'child-b']);
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
    expect(parseSceneDocument({ version: 2, id: 'scene', objects: [] }).issues[0]?.message).toContain('version');
    expect(parseSceneDocument({ version: 1, id: '', objects: [] }).issues[0]?.message).toContain('id');
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
    expect(findSceneObjectsByLayer(runtime!, 'environment').map((object) => object.id)).toEqual(['tree']);
    expect(findSceneObjectsWithComponent(runtime!, SCENE_COMPONENT_TYPES.collider).map((object) => object.id)).toEqual(['tree']);
    expect(findSceneObject(runtime!, { tags: ['actor', 'player'], componentType: SCENE_COMPONENT_TYPES.rigidBody })?.id).toBe('player');
    expect(getSceneObjectComponent(document.objects[1]!, SCENE_COMPONENT_TYPES.meshRenderer)?.data).toEqual({
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
            objects: legacyObjects.map((node) => (
              node && typeof node === 'object'
                ? { id: (node as { id?: unknown }).id, name: (node as { label?: unknown }).label }
                : {}
            )),
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
    expect(migrated.document).toEqual(createSceneDocument({
      id: 'legacy',
      objects: [{ id: 'root', name: 'Root' }],
    }));
  });

  test('reports unsupported scene migrations', () => {
    const migrated = migrateSceneDocument({ version: 0, id: 'legacy', objects: [] });

    expect(migrated.ok).toBe(false);
    expect(migrated.issues[0]?.code).toBe('unsupported-scene-version');
  });
});
