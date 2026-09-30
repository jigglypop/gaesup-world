import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type { ActiveStateType } from '../../../motions/core/types';
import { ThirdPersonController } from '../../controllers/ThirdPersonController';
import { peekCameraOcclusion } from '../CameraOcclusion';
import { CameraSystem } from '../CameraSystem';
import { MERGED_PARTS_KEY } from '../seeThrough';
import type { CameraCalcProps, CameraSystemConfig, CameraSystemState } from '../types';

// The character stands at the origin; the probe starts 1 m up and runs along +z to the camera 10 m away.
const config = (overrides: Partial<CameraSystemConfig> = {}): CameraSystemConfig => ({
  mode: 'thirdPerson',
  distance: { x: 0, y: 1, z: -10 },
  enableCollision: true,
  collisionMargin: 0.1,
  smoothing: { position: 1000, rotation: 1000, fov: 1000 },
  zoom: 1,
  ...overrides,
});

const activeState = (): ActiveStateType => ({
  euler: new THREE.Euler(),
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  isGround: true,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(0, 0, 1),
  dir: new THREE.Vector3(0, 0, 1),
  angular: new THREE.Vector3(),
});

function rig(overrides: Partial<CameraSystemConfig> = {}) {
  const scene = new THREE.Scene();
  const controller = new ThirdPersonController();
  const state: CameraSystemState = { config: config(overrides), lastUpdate: 0 };
  const props: CameraCalcProps = {
    camera: new THREE.PerspectiveCamera(), scene, deltaTime: 0.05, activeState: activeState(),
  };
  const run = (frames = 1) => {
    for (let i = 0; i < frames; i++) {
      scene.updateMatrixWorld(true);
      controller.update(props, state);
    }
    return props.camera.position;
  };
  return { scene, controller, state, props, run };
}

const box = (material: THREE.Material, x = 0, z = 5) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 0.5), material);
  mesh.position.set(x, 1, z);
  return mesh;
};

const opaque = () => new THREE.MeshStandardMaterial({ color: '#88aa55' });

test('the default mode still pushes the camera in front of an occluder and creates no fader', () => {
  const { scene, run } = rig();
  const material = opaque();
  const wall = box(material);
  scene.add(wall);
  expect(run(4).z).toBeCloseTo(4.65, 2);
  expect(wall.material).toBe(material);
  expect(peekCameraOcclusion(scene)).toBeUndefined();
});

test('fade keeps the camera distance and fades a copy, never the shared material', () => {
  const { scene, run, controller } = rig({ collisionMode: 'fade' });
  const shared = opaque();
  const wall = box(shared);
  const neighbour = box(shared, 20);
  scene.add(wall, neighbour);
  expect(run(1).z).toBeCloseTo(10, 5);
  const copy = wall.material as THREE.MeshStandardMaterial;
  expect(copy).not.toBe(shared);
  expect(copy.transparent).toBe(true);
  expect(copy.depthWrite).toBe(false);
  expect(copy.color.equals(shared.color)).toBe(true);
  run(10);
  expect(copy.opacity).toBeCloseTo(0.3, 5);
  expect(run(1).z).toBeCloseTo(10, 5);
  expect(neighbour.material).toBe(shared);
  expect(shared.transparent).toBe(false);
  expect(shared.opacity).toBe(1);
  expect(shared.depthWrite).toBe(true);
  controller.dispose();
});

test('an occluder that moves away fades back and gets its own material again; its copy is kept for the next fade', () => {
  const { scene, run, state, controller } = rig({ collisionMode: 'fade', collisionFadeOpacity: 0.5 });
  const material = opaque();
  const wall = box(material);
  scene.add(wall);
  run(10);
  const copy = wall.material as THREE.Material;
  expect(copy.opacity).toBeCloseTo(0.5, 5);
  const dispose = jest.spyOn(copy, 'dispose');
  wall.position.x = 30;
  run(1);
  // Held a moment, then fading back.
  expect(wall.material).toBe(copy);
  run(3);
  expect(copy.opacity).toBeGreaterThan(0.5);
  run(10);
  expect(wall.material).toBe(material);
  expect(dispose).not.toHaveBeenCalled();
  // The kept copy catches up with its material before it fades again.
  material.color.set('#ff0000');
  wall.position.x = 0;
  run(1);
  expect(wall.material).toBe(copy);
  expect((copy as THREE.MeshStandardMaterial).color.equals(material.color)).toBe(true);
  expect(copy.transparent).toBe(true);
  // Leaving fade mode fades back, restores, then drops the kept copies.
  state.config.collisionMode = 'push';
  run(20);
  expect(wall.material).toBe(material);
  expect(dispose).toHaveBeenCalledTimes(1);
  controller.dispose();
});

test('turning collision off for a while (a close-up) fades back but keeps the copy for when it comes back on', () => {
  const { scene, run, state, controller } = rig({ collisionMode: 'fade' });
  const material = opaque();
  const wall = box(material);
  scene.add(wall);
  run(5);
  const copy = wall.material as THREE.Material;
  const dispose = jest.spyOn(copy, 'dispose');
  state.config.enableCollision = false;
  run(20);
  expect(wall.material).toBe(material);
  expect(dispose).not.toHaveBeenCalled();
  state.config.enableCollision = true;
  run(1);
  expect(wall.material).toBe(copy);
  controller.dispose();
  expect(dispose).toHaveBeenCalledTimes(1);
});

test('dispose restores every faded occluder at once and frees the copies', () => {
  const { scene, run, controller } = rig({ collisionMode: 'fade' });
  const material = opaque();
  const wall = box(material);
  scene.add(wall);
  run(3);
  const copy = wall.material as THREE.Material;
  const dispose = jest.spyOn(copy, 'dispose');
  controller.dispose();
  expect(wall.material).toBe(material);
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(peekCameraOcclusion(scene)).toBeUndefined();
});

test('unmounting the camera system restores what its controllers faded', () => {
  const scene = new THREE.Scene();
  const system = new CameraSystem({
    mode: 'thirdPerson', distance: { x: 0, y: 1, z: -10 }, enableCollision: true, collisionMargin: 0.1, collisionMode: 'fade',
    smoothing: { position: 1000, rotation: 1000, fov: 1000 }, fov: 75, zoom: 1,
  });
  const material = opaque();
  const wall = box(material);
  scene.add(wall);
  scene.updateMatrixWorld(true);
  const props: CameraCalcProps = { camera: new THREE.PerspectiveCamera(), scene, deltaTime: 0.05, activeState: activeState() };
  system.calculate(props);
  expect(wall.material).not.toBe(material);
  system.destroy();
  expect(wall.material).toBe(material);
});

test('ground keeps pushing in fade mode: a path running down into the floor stops above it', () => {
  const { scene, run, controller } = rig({ collisionMode: 'fade', distance: { x: 0, y: -2, z: -10 } });
  const material = opaque();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), material);
  scene.add(floor);
  const camera = run(3);
  expect(camera.z).toBeLessThan(3.4);
  expect(camera.y).toBeGreaterThan(0);
  expect(floor.material).toBe(material);
  controller.dispose();
});

test('userData.cameraCollisionMode overrides the camera mode per object, and intangible meshes are never touched', () => {
  const faded = rig({ collisionMode: 'fade' });
  const pushMaterial = opaque();
  const pushWall = box(pushMaterial);
  pushWall.userData['cameraCollisionMode'] = 'push';
  faded.scene.add(pushWall);
  expect(faded.run(3).z).toBeCloseTo(4.65, 2);
  expect(pushWall.material).toBe(pushMaterial);
  faded.controller.dispose();

  const pushed = rig();
  const fadeMaterial = opaque();
  const fadeWall = box(fadeMaterial);
  const group = new THREE.Group();
  group.userData['cameraCollisionMode'] = 'fade';
  group.add(fadeWall);
  const characterMaterial = opaque();
  const character = box(characterMaterial, 0, 2);
  character.userData['intangible'] = true;
  pushed.scene.add(group, character);
  expect(pushed.run(3).z).toBeCloseTo(10, 5);
  expect(fadeWall.material).not.toBe(fadeMaterial);
  expect(character.material).toBe(characterMaterial);
  pushed.controller.dispose();
  expect(fadeWall.material).toBe(fadeMaterial);
});

test('an instanced batch fades only the occluding instance, drawn apart by a proxy, and gets the instance back', () => {
  const { scene, run, state, controller } = rig({ collisionMode: 'fade' });
  const material = opaque();
  const batch = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 4, 0.5), material, 2);
  const inPath = new THREE.Matrix4().makeTranslation(0, 1, 5);
  const aside = new THREE.Matrix4().makeTranslation(20, 1, 5);
  batch.setMatrixAt(0, inPath);
  batch.setMatrixAt(1, aside);
  scene.add(batch);
  expect(run(3).z).toBeCloseTo(10, 5);
  expect(batch.material).toBe(material);
  const matrix = new THREE.Matrix4();
  expect(batch.getMatrixAt(0, matrix).equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true);
  expect(batch.getMatrixAt(1, matrix).equals(aside)).toBe(true);
  const proxy = batch.children[0] as THREE.Mesh;
  expect(proxy.matrix.equals(inPath)).toBe(true);
  expect(proxy.material).not.toBe(material);
  expect((proxy.material as THREE.Material).transparent).toBe(true);
  // Still occluding through its proxy, although the batch no longer draws it.
  run(10);
  expect(batch.children).toContain(proxy);
  state.config.distance = { x: 10, y: 1, z: -10 };
  run(20);
  expect(batch.getMatrixAt(0, matrix).equals(inPath)).toBe(true);
  expect(batch.children).toHaveLength(0);
  controller.dispose();
});

test('going back to push returns a faded instance to its batch, which then blocks again', () => {
  const { scene, run, state, controller } = rig({ collisionMode: 'fade' });
  const batch = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 4, 0.5), opaque(), 1);
  const inPath = new THREE.Matrix4().makeTranslation(0, 1, 5);
  batch.setMatrixAt(0, inPath);
  scene.add(batch);
  expect(run(10).z).toBeCloseTo(10, 5);
  state.config.collisionMode = 'push';
  run(20);
  expect(batch.getMatrixAt(0, new THREE.Matrix4()).equals(inPath)).toBe(true);
  expect(batch.children).toHaveLength(0);
  expect(run(1).z).toBeCloseTo(4.65, 2);
  controller.dispose();
});

test('a merged geometry fades only the part in the way, in a group of its own', () => {
  const { scene, run, state, controller } = rig({ collisionMode: 'fade' });
  const inPath = new THREE.BoxGeometry(4, 4, 0.5).translate(0, 1, 5);
  const aside = new THREE.BoxGeometry(4, 4, 0.5).translate(20, 1, 5);
  const geometry = mergeGeometries([inPath, aside])!;
  const first = inPath.index!.count;
  geometry.userData[MERGED_PARTS_KEY] = [first, first + aside.index!.count];
  const material = opaque();
  const cell = new THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>(geometry, material);
  scene.add(cell);
  expect(run(3).z).toBeCloseTo(10, 5);
  const materials = cell.material as THREE.Material[];
  expect(materials[0]).toBe(material);
  expect(materials[1]!.transparent).toBe(true);
  expect(geometry.groups).toEqual([
    { start: 0, count: first, materialIndex: 1 },
    { start: first, count: aside.index!.count, materialIndex: 0 },
  ]);
  state.config.distance = { x: 10, y: 1, z: -10 };
  run(20);
  expect(cell.material).toBe(material);
  expect(geometry.groups).toHaveLength(0);
  // An edit rebuilds the cell with other part offsets; the kept fade takes the new range.
  const denser = new THREE.BoxGeometry(4, 4, 0.5, 3, 3, 1).translate(0, 1, 5);
  const rebuilt = mergeGeometries([denser, aside])!;
  rebuilt.userData[MERGED_PARTS_KEY] = [denser.index!.count, denser.index!.count + aside.index!.count];
  cell.geometry = rebuilt;
  state.config.distance = { x: 0, y: 1, z: -10 };
  run(3);
  expect(rebuilt.groups[0]).toEqual({ start: 0, count: denser.index!.count, materialIndex: 1 });
  controller.dispose();
  expect(cell.material).toBe(material);
  expect(rebuilt.groups).toHaveLength(0);
});
