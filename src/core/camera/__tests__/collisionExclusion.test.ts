import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

import { cameraUtils, invalidateCollisionCache } from '../utils/camera';

test('does not raycast screen-space line helpers as solid camera obstacles', () => {
  const geometry = new LineGeometry();
  geometry.setPositions([-1, 0, 5, 1, 0, 5]);
  const material = new LineMaterial({ worldUnits: false });
  const line = new Line2(geometry, material);
  const raycast = jest.spyOn(line, 'raycast');
  const scene = new THREE.Scene();
  scene.add(line);
  scene.updateMatrixWorld(true);
  try {
    expect(cameraUtils.improvedCollisionCheck(new THREE.Vector3(), new THREE.Vector3(0, 0, 10), scene).safe).toBe(true);
    expect(raycast).not.toHaveBeenCalled();
  } finally {
    raycast.mockRestore();
    geometry.dispose();
    material.dispose();
  }
});

test('inherits collision exclusion from ancestors and observes later changes', () => {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const nested = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.computeBoundingSphere();
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 5;
  nested.add(mesh);
  group.add(nested);
  scene.add(group);
  scene.updateMatrixWorld(true);
  const raycast = jest.spyOn(mesh, 'raycast');
  const from = new THREE.Vector3();
  const to = new THREE.Vector3(0, 0, 10);
  try {
    group.userData['intangible'] = true;
    expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(true);
    expect(raycast).not.toHaveBeenCalled();
    group.userData['intangible'] = false;
    expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(false);
    expect(raycast).toHaveBeenCalledTimes(1);
    raycast.mockClear();
    expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5, [group]).safe).toBe(true);
    expect(raycast).not.toHaveBeenCalled();
  } finally {
    raycast.mockRestore();
    geometry.dispose();
    material.dispose();
  }
});

test('prunes excluded subtrees and sees an obstacle as soon as exclusion is removed', () => {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.computeBoundingSphere();
  const material = new THREE.MeshBasicMaterial();
  const obstacle = new THREE.Mesh(geometry, material);
  obstacle.position.z = 5;
  group.add(obstacle);
  scene.add(group);
  scene.updateMatrixWorld(true);
  const children = group.children;
  const readChildren = jest.fn(() => children);
  Object.defineProperty(group, 'children', { configurable: true, get: readChildren });
  const from = new THREE.Vector3();
  const to = new THREE.Vector3(0, 0, 10);
  try {
    expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5, [group]).safe).toBe(true);
    expect(readChildren).not.toHaveBeenCalled();
    expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(false);
    group.remove(obstacle);
    expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(true);
  } finally { geometry.dispose(); material.dispose(); }
});

test('explicitly invalidates a populated collision cache even during its first 60 frames', () => {
  const scene = Object.assign(new THREE.Scene(), { _frameId: 0 });
  const from = new THREE.Vector3();
  const to = new THREE.Vector3(0, 0, 10);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(true);
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.computeBoundingSphere();
  const material = new THREE.MeshBasicMaterial();
  const obstacle = new THREE.Mesh(geometry, material);
  obstacle.position.z = 5;
  scene.add(obstacle);
  scene.updateMatrixWorld(true);
  try {
    invalidateCollisionCache();
    expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(false);
  } finally { invalidateCollisionCache(); geometry.dispose(); material.dispose(); }
});
