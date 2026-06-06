import {
  canSceneLayersCollide,
  createSceneDocument,
  createSceneLayerDefinition,
  createSceneLayerTagRegistry,
  getSceneLayersByPurpose,
  isSceneLayerSelectable,
  isSceneLayerVisible,
  validateProjectCollisionLayers,
  validateSceneLayerTagRegistry,
  validateSceneObjectLayersAndTags,
} from '..';
import { DEFAULT_PROJECT_SETTINGS } from '../../project-settings';

describe('scene layer and tag registry', () => {
  test('creates default layer and tag registry for runtime/editor filters', () => {
    const registry = createSceneLayerTagRegistry();

    expect(validateSceneLayerTagRegistry(registry).valid).toBe(true);
    expect(getSceneLayersByPurpose(registry, 'collision').map((layer) => layer.id)).toContain('player');
    expect(isSceneLayerVisible(registry, 'default')).toBe(true);
    expect(isSceneLayerSelectable(registry, 'editor')).toBe(false);
  });

  test('validates duplicate layers, layer indexes, and tags', () => {
    const registry = createSceneLayerTagRegistry({
      layers: [
        { id: 'actors', index: 1 },
        { id: 'actors', index: 2 },
        { id: 'props', index: 1 },
      ],
      tags: [{ id: 'quest' }, { id: 'quest' }],
    });

    const result = validateSceneLayerTagRegistry(registry);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'duplicate-layer',
      'duplicate-layer-index',
      'duplicate-tag',
    ]));
  });

  test('validates scene object layer and tag references', () => {
    const registry = createSceneLayerTagRegistry({
      layers: [
        { id: 'actors' },
        { id: 'world' },
      ],
      tags: [
        { id: 'player' },
        { id: 'resource' },
      ],
    });
    const document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'player', layer: 'actors', tags: ['player'] },
        { id: 'tree', layer: 'missing-layer', tags: ['resource', 'missing-tag'] },
      ],
    });

    const result = validateSceneObjectLayersAndTags(document, registry);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'unknown-object-layer',
      'unknown-object-tag',
    ]));
  });

  test('checks collision matrix against known layers', () => {
    const registry = createSceneLayerTagRegistry();

    expect(validateProjectCollisionLayers(DEFAULT_PROJECT_SETTINGS.physics, registry).valid).toBe(true);
    expect(canSceneLayersCollide(DEFAULT_PROJECT_SETTINGS.physics, 'player', 'environment')).toBe(true);
    expect(canSceneLayersCollide(DEFAULT_PROJECT_SETTINGS.physics, 'editor', 'player')).toBe(false);
    expect(validateProjectCollisionLayers({
      collisionMatrix: {
        unknown: ['player'],
        player: ['ghost'],
      },
    }, registry).issues.map((issue) => issue.code)).toEqual([
      'unknown-collision-layer',
      'unknown-collision-layer',
    ]);
  });

  test('supports custom non-selectable editor layers', () => {
    const layer = createSceneLayerDefinition({
      id: 'gizmo',
      purposes: ['editor'],
      visible: true,
      selectable: false,
    });
    const registry = createSceneLayerTagRegistry({ layers: [layer] });

    expect(isSceneLayerVisible(registry, 'gizmo')).toBe(true);
    expect(isSceneLayerSelectable(registry, 'gizmo')).toBe(false);
  });
});
