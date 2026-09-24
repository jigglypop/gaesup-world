import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';

import { CAMERA_COLLIDER_LAYER } from '../core/CameraCollisionIndex';
import { resolveCollisionPosition } from '../utils/camera';

const from = new Vector3();
const to = new Vector3(0, 0, 10);
const geometry = new BoxGeometry(2, 2, 1);
const material = new MeshBasicMaterial();

function box(z: number, collider = false): Mesh {
  const mesh = new Mesh(geometry, material);
  mesh.position.z = z;
  if (collider) mesh.layers.enable(CAMERA_COLLIDER_LAYER);
  return mesh;
}

function resolveZ(scene: Scene, targets: 'scene' | 'colliders', excluded?: Group[]): number {
  return resolveCollisionPosition(from, to, scene, 0.5, excluded, new Vector3(), targets).z;
}

afterAll(() => {
  geometry.dispose();
  material.dispose();
});

test('collider 모드는 충돌 레이어 메시만 막고 장면 모드는 모든 메시가 막는다', () => {
  const scene = new Scene();
  scene.add(box(3), box(6, true));
  expect(resolveZ(scene, 'colliders')).toBeCloseTo(5);
  expect(resolveZ(scene, 'scene')).toBeCloseTo(2);
});

test('충돌 레이어 메시가 없으면 장면 전체 검사로 돌아간다', () => {
  const scene = new Scene();
  scene.add(box(3));
  expect(resolveZ(scene, 'colliders')).toBeCloseTo(resolveZ(scene, 'scene'));
});

test('렌더 없이 추가·이동한 collider를 즉시 반영하고 intangible·제외 조상은 건너뛴다', () => {
  const scene = new Scene();
  scene.add(box(8, true));
  const parent = new Group();
  const wall = box(3, true);
  parent.add(wall);
  scene.add(parent);
  expect(resolveZ(scene, 'colliders')).toBeCloseTo(2);
  wall.position.z = 5;
  expect(resolveZ(scene, 'colliders')).toBeCloseTo(4);
  parent.userData['intangible'] = true;
  expect(resolveZ(scene, 'colliders')).toBeCloseTo(7);
  parent.userData['intangible'] = false;
  expect(resolveZ(scene, 'colliders', [parent])).toBeCloseTo(7);
});

test('캐시가 유효하면 장면을 다시 순회하지 않고 collider가 아닌 메시의 행렬은 갱신하지 않는다', () => {
  const scene = new Scene();
  const decoration = box(3);
  scene.add(decoration, box(6, true));
  resolveZ(scene, 'colliders');
  const traverse = jest.spyOn(scene, 'traverse');
  const decorationMatrix = jest.spyOn(decoration, 'updateWorldMatrix');
  try {
    expect(resolveZ(scene, 'colliders')).toBeCloseTo(5);
    expect(traverse).not.toHaveBeenCalled();
    expect(decorationMatrix).not.toHaveBeenCalled();
  } finally {
    traverse.mockRestore();
    decorationMatrix.mockRestore();
  }
});
