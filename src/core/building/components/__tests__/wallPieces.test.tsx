import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { wallBox, wallPieces } from '../../model/footprint';
import type { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { BuildingBatches } from '../BuildingBatches';
import { WallSystem } from '../WallSystem';
import { createWallPartsGeometry } from '../WallSystem/batch';

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

test('windows draw one instanced mesh for their frame and one for the glass however many walls there are', async () => {
  const group = windows('a', 30);
  const renderer = await ReactThreeTestRenderer.create(<WallSystem wallGroup={group} meshes={meshes} colliders={false} />);
  try {
    const found = drawn(renderer.scene.instance as THREE.Object3D);
    // The four frame bars are one geometry; the glass pane is the other.
    expect(found).toHaveLength(2);
    expect(found.every((mesh) => mesh instanceof THREE.InstancedMesh && mesh.count === 30)).toBe(true);
  } finally {
    await renderer.unmount();
  }
});

test('wall parts draw as three groups whatever their count: every edge face, then every front, then every back', () => {
  const geometry = createWallPartsGeometry([{ size: [1, 2, 0.2] }, { size: [0.5, 0.5, 0.2], position: [2, 0, 0] }]);
  // A box has 36 indices: its four edge faces take 24, its front and back 6 each.
  expect(geometry.groups).toEqual([
    { start: 0, count: 48, materialIndex: 0 },
    { start: 48, count: 12, materialIndex: 4 },
    { start: 60, count: 12, materialIndex: 5 },
  ]);
  geometry.computeBoundingBox();
  expect(geometry.boundingBox!.max.toArray().map((value) => Number(value.toFixed(4)))).toEqual([2.25, 1, 0.1]);
  // Fronts face +z and backs -z, as the materials that paint them expect.
  const normals = geometry.getAttribute('normal');
  const normalZ = (group: number) => normals.getZ(geometry.index!.getX(geometry.groups[group]!.start));
  expect([normalZ(1), normalZ(2)]).toEqual([1, -1]);
});

test('the world batches draw the pieces of every group, and a click on a piece selects its wall', async () => {
  const groups = [windows('a', 10), windows('b', 10)];
  const onWallClick = jest.fn();
  const renderer = await ReactThreeTestRenderer.create(
    <BuildingBatches tileGroups={[]} wallGroups={groups} wallGroupMap={new Map(groups.map((group) => [group.id, group]))} meshes={meshes} onWallClick={onWallClick} />,
  );
  try {
    const pieces = renderer.scene.findAll((node) => String(node.props['name'] ?? '').startsWith('building-batch:wall-piece:'));
    expect(pieces).toHaveLength(2);
    expect(pieces.every((piece) => (piece.instance as unknown as THREE.InstancedMesh).count === 20)).toBe(true);
    await renderer.fireEvent(pieces[0]!, 'click', { instanceId: 12 });
    expect(onWallClick).toHaveBeenCalledWith('b-2');
  } finally {
    await renderer.unmount();
  }
});

test('an instance stands where its wall does, and each piece sits at its offset in the wall', async () => {
  const group = windows('a', 1);
  const wall = { ...group.walls[0]!, position: { x: 8, y: 1, z: -4 }, rotation: { x: 0, y: Math.PI / 2, z: 0 } };
  const renderer = await ReactThreeTestRenderer.create(<WallSystem wallGroup={{ ...group, walls: [wall] }} meshes={meshes} colliders={false} />);
  try {
    const { center, rotationY } = wallBox(wall);
    const expected = new THREE.Matrix4().makeRotationY(rotationY).setPosition(center[0], wall.position.y, center[2]);
    const round = (matrix: THREE.Matrix4) => matrix.elements.map((value) => Number(value.toFixed(6)));
    const found = drawn(renderer.scene.instance as THREE.Object3D) as THREE.InstancedMesh[];
    for (const mesh of found) {
      const matrix = new THREE.Matrix4();
      mesh.getMatrixAt(0, matrix);
      expect(round(matrix)).toEqual(round(expected));
    }
    const frame = found.find((mesh) => mesh.name.includes(':window:frame:'))!;
    const positions = frame.geometry.getAttribute('position');
    const corners = new Set(Array.from({ length: positions.count }, (_, i) => [positions.getX(i), positions.getY(i), positions.getZ(i)].map((value) => value.toFixed(4)).join()));
    for (const piece of wallPieces('window').filter((entry) => entry.role === 'frame')) {
      const corner = piece.position.map((value, axis) => (value + piece.size[axis]! / 2).toFixed(4)).join();
      expect(corners.has(corner)).toBe(true);
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
    expect(frames).toHaveLength(1);
    expect(frames.every((mesh) => mesh.castShadow)).toBe(true);
  } finally {
    await renderer.unmount();
  }
});
