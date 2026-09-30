import ReactThreeTestRenderer from '@react-three/test-renderer';

import type { TileConfig } from '../../../../types';
import { TILE_CONSTANTS } from '../../../../types/constants';
import { GrassChunks } from '../chunks';

const mockCells = new Map<string, unknown[]>();
jest.mock('../Grass', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return {
    __esModule: true,
    default: ({ position, cells }: { position: number[]; cells: unknown }) => {
      const key = position.join();
      mockCells.set(key, [...(mockCells.get(key) ?? []), cells]);
      return null;
    },
    createGrassGround: () => new three.BufferGeometry(),
    getGrassGroundMaterial: () => new three.MeshBasicMaterial(),
  };
});

const cell = TILE_CONSTANTS.GRID_CELL_SIZE;
// 16 x 8 tiles: two 8 x 8 blade chunks side by side.
const field = (raise?: string): TileConfig[] => Array.from({ length: 128 }, (_, i) => ({
  id: `t${i}`, tileGroupId: 'g', size: 1, objectType: 'grass' as const,
  position: { x: (i % 16) * cell + cell / 2, y: `t${i}` === raise ? 1 : 0, z: Math.floor(i / 16) * cell + cell / 2 },
}));

test('an edit rebuilds the blades of the chunk it touches and keeps the other chunks as they were', async () => {
  const renderer = await ReactThreeTestRenderer.create(<GrassChunks tiles={field()} />);
  try {
    await renderer.update(<GrassChunks tiles={field('t0')} />);
    const [edited, untouched] = [...mockCells.values()].sort((a, b) => (a[0] as unknown[]).length - (b[0] as unknown[]).length);
    expect(mockCells.size).toBe(2);
    expect(edited![0]).not.toBe(edited!.at(-1));
    expect(new Set(untouched)).toHaveProperty('size', 1);
  } finally {
    await renderer.unmount();
  }
});
