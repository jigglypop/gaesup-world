import {
  createPrefabDocument,
  createPrefabFromSceneObjects,
  instantiatePrefabObjects,
  parsePrefabDocument,
  serializePrefabDocument,
  validatePrefabDocument,
} from '../index';
import { createMeshRendererComponent } from '../../scene-object';

describe('prefab document model', () => {
  test('creates a reusable scene object tree template', () => {
    const prefab = createPrefabDocument({
      id: 'crate',
      name: 'Crate',
      objects: [
        {
          id: 'root',
          name: 'Crate Root',
          components: [createMeshRendererComponent({ assetId: 'crate.glb' })],
          tags: ['prop'],
        },
        {
          id: 'handle',
          name: 'Handle',
          parentId: 'root',
        },
      ],
      metadata: {
        tags: ['props', 'wood'],
        description: 'Reusable crate object',
      },
    });

    expect(prefab.rootObjectIds).toEqual(['root']);
    expect(prefab.metadata.tags).toEqual(['props', 'wood']);
    expect(validatePrefabDocument(prefab).valid).toBe(true);
  });

  test('serializes and parses prefab documents', () => {
    const prefab = createPrefabDocument({
      id: 'lamp',
      objects: [{ id: 'root', name: 'Lamp' }],
    });

    const parsed = parsePrefabDocument(serializePrefabDocument(prefab));

    expect(parsed.ok).toBe(true);
    expect(parsed.prefab).toEqual(prefab);
  });

  test('reports invalid prefab roots', () => {
    const prefab = createPrefabDocument({
      id: 'broken',
      objects: [{ id: 'root', name: 'Root' }],
      rootObjectIds: ['missing'],
    });

    const result = validatePrefabDocument(prefab);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('missing-root-object');
    expect(result.issues.map((issue) => issue.code)).toContain('invalid-root-object');
  });

  test('instantiates prefabs with stable object and component id remaps', () => {
    const prefab = createPrefabFromSceneObjects({
      id: 'door',
      objects: [
        {
          id: 'root',
          name: 'Door',
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          components: [{ id: 'mesh', type: 'meshRenderer', enabled: true, data: { assetId: 'door.glb' } }],
          tags: [],
        },
        {
          id: 'knob',
          name: 'Knob',
          parentId: 'root',
          transform: { position: [0.4, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          components: [],
          tags: [],
        },
      ],
    });

    const objects = instantiatePrefabObjects(prefab, {
      idPrefix: 'door-1',
      parentId: 'room',
      rootTransform: { position: [5, 0, 2] },
    });

    expect(objects.map((object) => object.id)).toEqual(['door-1:root', 'door-1:knob']);
    expect(objects[0]?.parentId).toBe('room');
    expect(objects[1]?.parentId).toBe('door-1:root');
    expect(objects[0]?.transform.position).toEqual([5, 0, 2]);
    expect(objects[0]?.components[0]?.id).toBe('door-1:mesh');
  });
});
