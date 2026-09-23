import * as THREE from 'three';

import { cameraUtils } from '../../utils/camera';
import {
  CAMERA_COLLIDER_LAYER,
  CameraCollisionIndex,
  getCameraCollisionIndex,
  invalidateCameraColliders,
} from '../CameraCollisionIndex';

function createBox(z: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.position.z = z;
  return mesh;
}

describe('CameraCollisionIndex', () => {
  test('씬이 바뀌지 않으면 순회하지 않고 캐시를 재사용한다', () => {
    const scene = new THREE.Scene();
    scene.add(createBox(5));
    const index = new CameraCollisionIndex(scene);
    const traverse = jest.spyOn(scene, 'traverse');

    expect(index.getTargets()).toHaveLength(1);
    expect(index.getTargets()).toHaveLength(1);
    expect(traverse).toHaveBeenCalledTimes(1);
    expect(index.getRebuildCount()).toBe(1);
  });

  test('깊은 자식의 추가와 제거를 다음 질의에서 반영한다', () => {
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    const nested = new THREE.Group();
    group.add(nested);
    scene.add(group);
    const index = new CameraCollisionIndex(scene);
    expect(index.getTargets()).toHaveLength(0);

    const box = createBox(5);
    nested.add(box);
    expect(index.getTargets()).toEqual([box]);

    nested.remove(box);
    expect(index.getTargets()).toHaveLength(0);
    expect(index.getRebuildCount()).toBe(3);

    box.add(createBox(1));
    expect(index.getRebuildCount()).toBe(3);
    index.dispose();
  });

  test('카메라 충돌 레이어가 있으면 그 메시만, 없으면 전체 메시를 대상으로 한다', () => {
    const scene = new THREE.Scene();
    const wall = createBox(5);
    const prop = createBox(3);
    scene.add(wall, prop);
    const index = new CameraCollisionIndex(scene);
    expect(index.getTargets()).toHaveLength(2);

    wall.layers.enable(CAMERA_COLLIDER_LAYER);
    invalidateCameraColliders();
    expect(index.getTargets()).toEqual([wall]);
  });

  test('충돌 판정은 결과 객체를 재사용하고 가장 가까운 장애물로 위치를 계산한다', () => {
    const scene = new THREE.Scene();
    scene.add(createBox(8), createBox(4));
    scene.updateMatrixWorld(true);
    const from = new THREE.Vector3();
    const to = new THREE.Vector3(0, 0, 10);

    const first = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
    expect(first.safe).toBe(false);
    expect(first.obstacles).toHaveLength(2);
    expect(first.position.z).toBeCloseTo(3);
    const obstacles = first.obstacles;

    scene.clear();
    const second = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
    expect(second).toBe(first);
    expect(second.obstacles).toBe(obstacles);
    expect(second.safe).toBe(true);
    expect(second.position.equals(to)).toBe(true);
    expect(getCameraCollisionIndex(scene).getTargets()).toHaveLength(0);
  });
});
