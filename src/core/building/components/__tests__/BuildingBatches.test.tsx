import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import type { MeshConfig, TileConfig, TileGroupConfig, WallConfig, WallGroupConfig } from '../../types';
import { BuildingBatches } from '../BuildingBatches';

type View = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

const meshes = new Map<string, MeshConfig>([
  ['floor', { id: 'floor', color: '#8ea36b' }],
  ['stone', { id: 'stone', color: '#777777' }],
  ['brick', { id: 'brick', color: '#c9b79c' }],
]);

const tile = (groupId: string, index: number, extra: Partial<TileConfig> = {}): TileConfig => ({
  id: `${groupId}-${index}`, tileGroupId: groupId, size: 1, position: { x: index * 4, y: 0, z: 0 }, ...extra,
});

const tileGroup = (id: string, tiles: TileConfig[]): TileGroupConfig => ({ id, name: id, floorMeshId: 'floor', tiles });

const wall = (groupId: string, index: number, extra: Partial<WallConfig> = {}): WallConfig => ({
  id: `${groupId}-${index}`, wallGroupId: groupId, position: { x: index * 4, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, ...extra,
});

const wallGroup = (id: string, walls: WallConfig[]): WallGroupConfig => ({
  id, name: id, frontMeshId: 'brick', backMeshId: 'brick', sideMeshId: 'brick', walls,
});

function batches(view: View, kind: 'tile' | 'wall'): THREE.InstancedMesh[] {
  const found: THREE.InstancedMesh[] = [];
  (view.scene.instance as THREE.Object3D).traverse((object) => {
    if (object instanceof THREE.InstancedMesh && object.name.startsWith(`building-batch:${kind}:`)) found.push(object);
  });
  return found;
}

test('box tiles with the same material draw as one batch across groups; only raised tiles cast shadows', async () => {
  const groups = [
    tileGroup('a', [tile('a', 0), tile('a', 1), tile('a', 2, { shape: 'round' })]),
    tileGroup('b', [tile('b', 0), tile('b', 1, { materialId: 'stone' }), tile('b', 2, { position: { x: 8, y: 1, z: 0 } })]),
  ];
  const view = await ReactThreeTestRenderer.create(
    <BuildingBatches tileGroups={groups} wallGroups={[]} wallGroupMap={new Map()} meshes={meshes} />,
  );
  try {
    const byName = new Map(batches(view, 'tile').map((mesh) => [mesh.name, [mesh.count, mesh.castShadow]]));
    expect(byName).toEqual(new Map([
      ['building-batch:tile:floor', [3, false]],
      ['building-batch:tile:stone', [1, false]],
      ['building-batch:tile:floor:raised', [1, true]],
    ]));
  } finally {
    await view.unmount();
  }
});

test('solid walls with the same materials draw as one single-material batch and pick across groups', async () => {
  const groups = [
    wallGroup('a', [wall('a', 0), wall('a', 1, { wallKind: 'window' })]),
    wallGroup('b', [wall('b', 0), wall('b', 1)]),
  ];
  const onWallClick = jest.fn();
  const view = await ReactThreeTestRenderer.create(
    <BuildingBatches
      tileGroups={[]}
      wallGroups={groups}
      wallGroupMap={new Map(groups.map((group) => [group.id, group]))}
      meshes={meshes}
      onWallClick={onWallClick}
    />,
  );
  try {
    const [batch, ...rest] = batches(view, 'wall');
    expect(rest).toHaveLength(0);
    expect(batch!.count).toBe(3);
    expect(Array.isArray(batch!.material)).toBe(false);
    const element = view.scene.findAll((node) => node.instance === batch)[0]!;
    await view.fireEvent(element, 'click', { instanceId: 2 });
    expect(onWallClick).toHaveBeenCalledWith('b-1');
  } finally {
    await view.unmount();
  }
});

test('growing a batch keeps every instance', async () => {
  const render = (count: number) => (
    <BuildingBatches
      tileGroups={[tileGroup('a', Array.from({ length: count }, (_, index) => tile('a', index)))]}
      wallGroups={[]}
      wallGroupMap={new Map()}
      meshes={meshes}
    />
  );
  const view = await ReactThreeTestRenderer.create(render(2));
  try {
    await view.update(render(7));
    const [batch] = batches(view, 'tile');
    expect(batch!.count).toBe(7);
    expect(batch!.instanceMatrix.count).toBeGreaterThanOrEqual(7);
    const matrix = new THREE.Matrix4();
    batch!.getMatrixAt(6, matrix);
    expect(new THREE.Vector3().setFromMatrixPosition(matrix).x).toBe(24);
  } finally {
    await view.unmount();
  }
});
