import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import type { MeshConfig, TileConfig, TileGroupConfig, WallGroupConfig } from '../../types';
import { BlockSystem } from '../BlockSystem';
import { BuildingBatches } from '../BuildingBatches';
import { TileSystem } from '../TileSystem';
import { WallSystem } from '../WallSystem';

let mockColliderRenders = 0;
const mockManagers = jest.fn();
jest.mock('../BuildingColliders', () => ({ BuildingColliderBody: () => { mockColliderRenders++; return null; } }));
jest.mock('../../core/MaterialManager', () => {
  const actual = jest.requireActual<typeof import('../../core/MaterialManager')>('../../core/MaterialManager');
  return { MaterialManager: class extends actual.MaterialManager { constructor() { super(); mockManagers(); } } };
});

const meshes = new Map<string, MeshConfig>([['stone', { id: 'stone', color: '#888888' }], ['wood', { id: 'wood', color: '#aa7744' }]]);
const tiles = (groupId: string): TileConfig[] =>
  Array.from({ length: 30 }, (_, i) => ({ id: `${groupId}-${i}`, tileGroupId: groupId, size: 1, position: { x: i * 4, y: 0, z: groupId === 'a' ? 0 : 8 } }));
const tileGroups = (a: TileConfig[], b: TileConfig[]): TileGroupConfig[] => [
  { id: 'a', name: 'a', floorMeshId: 'stone', tiles: a },
  { id: 'b', name: 'b', floorMeshId: 'wood', tiles: b },
];
const wallGroup: WallGroupConfig = { id: 'w', name: 'w', walls: [] };

beforeEach(() => {
  mockColliderRenders = 0;
  mockManagers.mockClear();
});

test('a tile edit rewrites the instance matrices of its own batch only', async () => {
  const setMatrixAt = jest.spyOn(THREE.InstancedMesh.prototype, 'setMatrixAt');
  const a = tiles('a');
  const b = tiles('b');
  const batches = (groups: TileGroupConfig[]) => <BuildingBatches tileGroups={groups} wallGroups={[]} wallGroupMap={new Map()} meshes={meshes} />;
  const renderer = await ReactThreeTestRenderer.create(batches(tileGroups(a, b)));
  try {
    setMatrixAt.mockClear();
    const edited = a.map((tile, index) => (index === 3 ? { ...tile, objectType: 'grass' as const } : tile));
    await renderer.update(batches(tileGroups(edited, b)));
    expect(setMatrixAt).toHaveBeenCalledTimes(a.length);
  } finally {
    setMatrixAt.mockRestore();
    await renderer.unmount();
  }
});

test('tile and wall groups skip a building re-render that leaves their props alone, and make one material manager', async () => {
  const [group] = tileGroups(tiles('a'), []);
  const scene = (tick: number) => (
    <group userData={{ tick }}>
      <TileSystem tileGroup={group!} meshes={meshes} colliders={false} batches={false} />
      <WallSystem wallGroup={wallGroup} meshes={meshes} colliders={false} batches={false} />
      <BlockSystem blocks={[]} meshes={meshes} colliders={false} />
    </group>
  );
  const renderer = await ReactThreeTestRenderer.create(scene(0));
  try {
    const firstRender = mockColliderRenders;
    await renderer.update(scene(1));
    await renderer.update(scene(2));
    // Only BlockSystem, which is not memoized, renders its collider body again.
    expect(mockColliderRenders - firstRender).toBe(2);
    expect(mockManagers).toHaveBeenCalledTimes(3);
  } finally {
    await renderer.unmount();
  }
});
