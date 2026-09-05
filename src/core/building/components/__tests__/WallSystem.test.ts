import { getWallMaterialKey } from '../WallSystem';
import type { WallConfig } from '../../types';

describe('WallSystem material grouping', () => {
  const baseWall: WallConfig = {
    id: 'wall-1',
    wallGroupId: 'brick-walls',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  test('uses the group material batch by default', () => {
    expect(getWallMaterialKey(baseWall)).toBe('type:brick-walls');
  });

  test('uses a per-wall material batch when materialId is set', () => {
    expect(getWallMaterialKey({ ...baseWall, materialId: 'wall-only-material' })).toBe('material:wall-only-material');
  });
});
