import { createPlacementAssetScopeId, createScopedColorMeshConfig } from '../index';

describe('BuildingPanel asset material scoping', () => {
  test('creates a fresh placement scope for each wall asset application', () => {
    const first = createPlacementAssetScopeId('placement-wall');
    const second = createPlacementAssetScopeId('placement-wall');

    expect(first).toMatch(/^placement-wall-/);
    expect(second).toMatch(/^placement-wall-/);
    expect(first).not.toBe(second);
  });

  test('creates a scoped color mesh without mutating shared texture fields', () => {
    expect(createScopedColorMeshConfig('tile-1-color', '#ffcc88', {
      id: 'shared-floor',
      color: '#111111',
      mapTextureUrl: '/old.png',
      textureUrl: '/old.png',
      materialParams: { roughness: 0.5, color: '#111111' },
    })).toEqual({
      id: 'tile-1-color',
      color: '#ffcc88',
      material: 'STANDARD',
      materialParams: { roughness: 0.5, color: '#ffcc88' },
    });
  });
});
