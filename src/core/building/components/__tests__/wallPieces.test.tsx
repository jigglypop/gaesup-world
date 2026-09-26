import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { wallBox, wallPieces } from '../../model/footprint';
import type { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { BuildingBatches } from '../BuildingBatches';
import { WallSystem } from '../WallSystem';

jest.mock('../BuildingColliders', () => ({ BuildingColliderBody: () => null }));

const meshes = new Map<string, MeshConfig>([['plaster', { id: 'plaster', color: '#c9b79c' }]]);
const windows = (groupId: string, count: number): WallGroupConfig => ({
  id: groupId, name: groupId, frontMeshId: 'plaster', backMeshId: 'plaster', sideMeshId: 'plaster',
  walls: Array.from({ length: count }, (_, i): WallConfig => ({
    id: `${groupId}-${i}`, wallGroupId: groupId, wallKind: 'window',
    position: { x: i * 4, y: 0, z: groupId === 'a' ? 0 : 12 }, rotation: { x: 0, y: 0, z: 0 },
  })),
});
const drawn = (root: THREE.Object3D) => {
  const found: THREE.Mesh[] = [];
  root.traverse((object) => { if (object instanceof THREE.Mesh) found.push(object); });
  return found;
};

test('windows draw one instanced mesh per piece however many walls there are', async () => {
  const group = windows('a', 30);
  const renderer = await ReactThreeTestRenderer.create(<WallSystem wallGroup={group} meshes={meshes} colliders={false} />);
  try {
    const found = drawn(renderer.scene.instance as THREE.Object3D);
    // Frames left, right, bottom, top and the glass pane.
    expect(found).toHaveLength(5);
    expect(found.every((mesh) => mesh instanceof THREE.InstancedMesh && mesh.count === 30)).toBe(true);
  } finally {
    await renderer.unmount();
  }
});

test('the world batches draw the pieces of every group, and a click on a piece selects its wall', async () => {
  const groups = [windows('a', 10), windows('b', 10)];
  const onWallClick = jest.fn();
  const renderer = await ReactThreeTestRenderer.create(
    <BuildingBatches tileGroups={[]} wallGroups={groups} wallGroupMap={new Map(groups.map((group) => [group.id, group]))} meshes={meshes} onWallClick={onWallClick} />,
  );
  try {
    const pieces = renderer.scene.findAll((node) => String(node.props['name'] ?? '').startsWith('building-batch:wall-piece:'));
    expect(pieces).toHaveLength(5);
    expect(pieces.every((piece) => (piece.instance as unknown as THREE.InstancedMesh).count === 20)).toBe(true);
    await renderer.fireEvent(pieces[0]!, 'click', { instanceId: 12 });
    expect(onWallClick).toHaveBeenCalledWith('b-2');
  } finally {
    await renderer.unmount();
  }
});

test('a piece instance stands where the piece of the wall group used to: wall position, then rotation, then piece offset', async () => {
  const group = windows('a', 1);
  const wall = { ...group.walls[0]!, position: { x: 8, y: 1, z: -4 }, rotation: { x: 0, y: Math.PI / 2, z: 0 } };
  const renderer = await ReactThreeTestRenderer.create(<WallSystem wallGroup={{ ...group, walls: [wall] }} meshes={meshes} colliders={false} />);
  try {
    const { center, rotationY } = wallBox(wall);
    for (const piece of wallPieces('window')) {
      const parent = new THREE.Object3D();
      parent.position.set(center[0], wall.position.y, center[2]);
      parent.rotation.y = rotationY;
      const child = new THREE.Object3D();
      child.position.set(...piece.position);
      parent.add(child);
      parent.updateMatrixWorld(true);
      const mesh = drawn(renderer.scene.instance as THREE.Object3D).find((entry) => entry.name.includes(`:window:${piece.key}:`)) as THREE.InstancedMesh;
      const matrix = new THREE.Matrix4();
      mesh.getMatrixAt(0, matrix);
      expect(matrix.elements.map((value) => Number(value.toFixed(6)))).toEqual(child.matrixWorld.elements.map((value) => Number(value.toFixed(6))));
    }
  } finally {
    await renderer.unmount();
  }
});

test('glass panes let the sun through: the frames cast shadows, the pane only receives them', async () => {
  const renderer = await ReactThreeTestRenderer.create(<WallSystem wallGroup={windows('a', 3)} meshes={meshes} colliders={false} />);
  try {
    const found = drawn(renderer.scene.instance as THREE.Object3D);
    const [glass, ...frames] = [...found].sort((a) => (a.name.includes(':glass:') ? -1 : 1));
    expect(glass!.name).toContain(':glass:');
    expect([glass!.castShadow, glass!.receiveShadow]).toEqual([false, true]);
    expect(frames).toHaveLength(4);
    expect(frames.every((mesh) => mesh.castShadow)).toBe(true);
  } finally {
    await renderer.unmount();
  }
});
