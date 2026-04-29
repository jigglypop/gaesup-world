import { createPlacementAssetScopeId } from '../index';

describe('BuildingPanel asset material scoping', () => {
  test('creates a fresh placement scope for each wall asset application', () => {
    const first = createPlacementAssetScopeId('placement-wall');
    const second = createPlacementAssetScopeId('placement-wall');

    expect(first).toMatch(/^placement-wall-/);
    expect(second).toMatch(/^placement-wall-/);
    expect(first).not.toBe(second);
  });
});
