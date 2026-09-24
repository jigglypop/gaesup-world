import * as THREE from 'three';

import { cameraUtils } from '../utils/camera';
import { cameraMeshMayIntersect } from '../utils/sphereSweep';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial();
afterAll(() => {
  geometry.dispose();
  material.dispose();
});

function rayAlongZ(): THREE.Ray {
  return new THREE.Ray(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));
}

test('bounding-sphere broadphase skips far meshes without raycasting them', () => {
  const scene = new THREE.Scene();
  const far = new THREE.Mesh(geometry, material);
  far.position.set(40, 0, 5);
  const blocker = new THREE.Mesh(geometry, material);
  blocker.position.z = 5;
  scene.add(far, blocker);
  // Spying on mesh.raycast would itself look like a custom raycast, so observe the raycaster instead.
  const intersectObject = jest.spyOn(THREE.Raycaster.prototype, 'intersectObject');

  // Zero radius uses the ray narrow phase, which makes the broadphase observable.
  const result = cameraUtils.improvedCollisionCheck(new THREE.Vector3(), new THREE.Vector3(0, 0, 10), scene, 0);

  expect(result.safe).toBe(false);
  expect(result.obstacles.map((obstacle) => obstacle.object)).toEqual([blocker]);
  expect(intersectObject.mock.calls.map(([object]) => object)).toEqual([blocker]);
});

test('a positive radius sweeps without a second ray narrow phase', () => {
  const scene = new THREE.Scene();
  const blocker = new THREE.Mesh(geometry, material);
  blocker.position.z = 5;
  scene.add(blocker);
  const intersectObject = jest.spyOn(THREE.Raycaster.prototype, 'intersectObject');

  const result = cameraUtils.improvedCollisionCheck(new THREE.Vector3(), new THREE.Vector3(0, 0, 10), scene, 0.5);

  expect(result.safe).toBe(false);
  expect(result.obstacles.map((obstacle) => obstacle.object)).toEqual([blocker]);
  expect(intersectObject).not.toHaveBeenCalled();
});

test('the broadphase is conservative for scaled parents, sweep radius and segment ends', () => {
  const ray = rayAlongZ();
  const parent = new THREE.Group();
  parent.scale.set(6, 1, 1);
  const scaled = new THREE.Mesh(geometry, material);
  scaled.position.set(0.5, 0, 5);
  parent.add(scaled);
  parent.updateMatrixWorld(true);
  // Scaled 6x on X: the box now spans x in [0, 6], touching the ray at x = 0.
  expect(cameraMeshMayIntersect(scaled, ray, 0, 10)).toBe(true);

  const offset = new THREE.Mesh(geometry, material);
  offset.position.set(1.2, 0, 5);
  offset.updateMatrixWorld(true);
  expect(cameraMeshMayIntersect(offset, ray, 0, 10)).toBe(false);
  expect(cameraMeshMayIntersect(offset, ray, 0.8, 10)).toBe(true);

  const beyond = new THREE.Mesh(geometry, material);
  beyond.position.set(0, 0, 12);
  beyond.updateMatrixWorld(true);
  expect(cameraMeshMayIntersect(beyond, ray, 0.5, 10)).toBe(false);
  expect(cameraMeshMayIntersect(beyond, ray, 0.5, 11.6)).toBe(true);

  const behind = new THREE.Mesh(geometry, material);
  behind.position.set(0, 0, -0.9);
  behind.updateMatrixWorld(true);
  // Initial overlap at the ray origin must still be reported.
  expect(cameraMeshMayIntersect(behind, ray, 0.5, 10)).toBe(true);
});

test('meshes with custom raycasts or morph targets bypass the broadphase', () => {
  const ray = rayAlongZ();
  const instanced = new THREE.InstancedMesh(geometry, material, 1);
  instanced.position.set(100, 0, 0);
  instanced.updateMatrixWorld(true);
  expect(cameraMeshMayIntersect(instanced, ray, 0, 10)).toBe(true);
  instanced.dispose();
});

test('iterative traversal keeps pre-order obstacle ordering', () => {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const first = new THREE.Mesh(geometry, material);
  first.position.z = 3;
  const second = new THREE.Mesh(geometry, material);
  second.position.z = 6;
  const third = new THREE.Mesh(geometry, material);
  third.position.z = 8;
  group.add(first, second);
  scene.add(group, third);

  const result = cameraUtils.improvedCollisionCheck(new THREE.Vector3(), new THREE.Vector3(0, 0, 10), scene, 0.1);

  expect(result.obstacles.map((obstacle) => obstacle.object)).toEqual([first, second, third]);
  expect(result.position.z).toBeCloseTo(2.4);
});
