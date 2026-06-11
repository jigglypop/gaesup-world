import { buildWaterPatches } from '../TileSystem/waterPatches';
import type { TileConfig } from '../../types';

describe('TileSystem water patches', () => {
  test('인접한 물 타일을 하나의 패치로 병합하고 외곽 해안만 표시한다', () => {
    const tiles: TileConfig[] = [
      {
        id: 'water-a',
        position: { x: 0, y: 0, z: 0 },
        tileGroupId: 'water',
        size: 1,
        objectType: 'water',
      },
      {
        id: 'water-b',
        position: { x: 4, y: 0, z: 0 },
        tileGroupId: 'water',
        size: 1,
        objectType: 'water',
      },
    ];
    expect(buildWaterPatches(tiles)).toEqual([
      {
        key: '0:-1:-1:4:2',
        center: [2, 0, 0],
        width: 8,
        depth: 4,
        shore: {
          north: true,
          south: true,
          east: true,
          west: true,
        },
      },
    ]);
  });
});
