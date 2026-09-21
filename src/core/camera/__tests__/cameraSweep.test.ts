import { BatchedMesh, Bone, BoxGeometry, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Ray, Scene, Skeleton, SkinnedMesh, Triangle, Uint16BufferAttribute, Vector3 } from 'three';

import { cameraUtils } from '../utils/camera';
import { sweepSphereTriangle } from '../utils/sphereSweep';

const from = new Vector3();
const to = new Vector3(0, 0, 10);

test('new unrendered meshes and same-frame hierarchy changes are immediately collidable', () => {
  const scene = Object.assign(new Scene(), { _frameId: 1 });
  expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(true);
  const mesh = new Mesh(new BoxGeometry(2, 2, 1), new MeshBasicMaterial());
  mesh.position.z = 3;
  scene.add(mesh);
  expect(mesh.geometry.boundingSphere).toBeNull();
  const result = cameraUtils.improvedCollisionCheck(from, to, scene);
  expect(result.safe).toBe(false);
  expect(result.position.z).toBeCloseTo(2);
  scene.remove(mesh);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene).safe).toBe(true);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('returned positions and obstacle points remain owned across caller mutations and subsequent queries', () => {
  const scene = new Scene(); const destination = to.clone();
  const clear = cameraUtils.improvedCollisionCheck(from, destination, scene);
  destination.z = 100;
  expect(clear.position.z).toBe(10);
  const mesh = new Mesh(new BoxGeometry(2, 2, 1), new MeshBasicMaterial());
  mesh.position.z = 3; scene.add(mesh);
  const first = cameraUtils.improvedCollisionCheck(from, to, scene);
  const position = first.position.clone(); const point = first.obstacles[0]!.point.clone();
  mesh.position.z = 5;
  expect(cameraUtils.improvedCollisionCheck(from, to, scene).position.z).toBeCloseTo(4);
  expect(first.position).toEqual(position);
  expect(first.obstacles[0]!.point).toEqual(point);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('radius catches an offset box while the center ray misses, including at the destination', () => {
  const scene = new Scene();
  const mesh = new Mesh(new BoxGeometry(1, 2, 1), new MeshBasicMaterial());
  mesh.position.set(0.8, 0, 5); scene.add(mesh);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0).safe).toBe(true);
  const result = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
  expect(result.safe).toBe(false);
  expect(result.position.z).toBeCloseTo(4.1);
  expect(result.position.distanceTo(result.obstacles[0]!.point)).toBeCloseTo(0.5);
  mesh.position.z = 10.7;
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).safe).toBe(false);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('sweep follows nonuniform parent transforms and instance matrices', () => {
  const scene = new Scene(); const group = new Group();
  group.position.z = 2; group.scale.set(2, 1, 0.5);
  const instances = new InstancedMesh(new BoxGeometry(1, 2, 1), new MeshBasicMaterial(), 2);
  instances.setMatrixAt(0, new Matrix4().makeTranslation(10, 0, 5));
  instances.setMatrixAt(1, new Matrix4().makeTranslation(0.7, 0, 6));
  group.add(instances); scene.add(group);
  const result = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
  expect(result.safe).toBe(false);
  expect(result.position.z).toBeCloseTo(4.45);
  instances.geometry.dispose(); (instances.material as MeshBasicMaterial).dispose(); instances.dispose();
});

test('analytic contacts cover triangle faces, edge cylinders, vertices, tangent and initial overlap', () => {
  const surface = new Triangle(new Vector3(0, 0, 5), new Vector3(2, 0, 5), new Vector3(0, 2, 5));
  const point = new Vector3();
  const sweep = (x: number, y: number, radius: number, limit = 10) => sweepSphereTriangle(new Ray(new Vector3(x, y, 0), new Vector3(0, 0, 1)), radius, surface, limit, point);
  expect(sweep(0.5, 0.5, 0.5)).toBeCloseTo(4.5);
  expect(sweep(-0.3, 1, 0.5)).toBeCloseTo(4.6);
  expect(sweep(-0.3, -0.3, 0.5)).toBeCloseTo(5 - Math.sqrt(0.07));
  expect(sweep(-0.5, 1, 0.5)).toBeCloseTo(5);
  expect(sweep(-0.51, 1, 0.5)).toBe(Infinity);
  expect(sweep(0.5, 0.5, 0.5, 4.49)).toBe(Infinity);
  expect(sweepSphereTriangle(new Ray(new Vector3(0.5, 0.5, 4.8), new Vector3(0, 0, -1)), 0.5, surface, 10, point)).toBe(0);
});

test('zero-length motion still reports overlap and misses leave the destination owned', () => {
  const scene = new Scene(); const mesh = new Mesh(new BoxGeometry(2, 2, 1), new MeshBasicMaterial());
  mesh.position.z = 0.7; scene.add(mesh);
  expect(cameraUtils.improvedCollisionCheck(from, from, scene, 0.5).safe).toBe(false);
  mesh.position.z = 2;
  const result = cameraUtils.improvedCollisionCheck(from, from, scene, 0.5);
  expect(result.safe).toBe(true); expect(result.position).not.toBe(from);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('runtime avatar subtree exclusion preserves other nearby solid geometry', () => {
  const scene = new Scene(); const group = new Group(); group.userData.intangible = true;
  const geometry = new BoxGeometry(2, 3, 2); const material = new MeshBasicMaterial();
  const avatar = new Mesh(geometry, material); group.add(avatar); scene.add(group);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).safe).toBe(true);
  const wall = new Mesh(geometry, material); wall.position.z = 3; scene.add(wall);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).safe).toBe(false);
  geometry.dispose(); material.dispose();
});

test('batched geometry uses active visible instances, their transforms and geometry ranges', () => {
  const scene = new Scene(); const geometry = new BoxGeometry(1, 2, 1); const material = new MeshBasicMaterial();
  const batch = new BatchedMesh(8, 100, 200, material);
  const geometryId = batch.addGeometry(geometry);
  const deleted = batch.addInstance(geometryId); const hidden = batch.addInstance(geometryId); const visible = batch.addInstance(geometryId);
  batch.setMatrixAt(visible, new Matrix4().makeTranslation(0.8, 0, 5));
  batch.setVisibleAt(hidden, false); batch.deleteInstance(deleted); scene.add(batch);
  const result = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
  expect(result.safe).toBe(false); expect(result.position.z).toBeCloseTo(4.1);
  batch.deleteInstance(visible);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).safe).toBe(true);
  batch.dispose(); geometry.dispose(); material.dispose();
});

test('skinned vertices observe changed bone transforms without a render', () => {
  const geometry = new BoxGeometry(1, 2, 1); const count = geometry.attributes.position!.count;
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Uint16Array(count * 4), 4));
  const weights = new Float32Array(count * 4); for (let i = 0; i < count; i++) weights[i * 4] = 1;
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial()); const bone = new Bone();
  mesh.add(bone); mesh.bind(new Skeleton([bone]));
  const scene = new Scene(); scene.add(mesh); bone.position.set(0.8, 0, 5);
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).position.z).toBeCloseTo(4.1);
  bone.position.z = 7;
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).position.z).toBeCloseTo(6.1);
  mesh.position.z = 1;
  expect(cameraUtils.improvedCollisionCheck(from, to, scene, 0.5).position.z).toBeCloseTo(7.1);
  geometry.dispose(); mesh.material.dispose(); mesh.skeleton.dispose();
});

test('per-instance morph targets use deformed positions outside the original geometry bounds', () => {
  const geometry = new BoxGeometry(1, 2, 1);
  const morph = geometry.attributes.position!.clone();
  for (let i = 0; i < morph.count; i++) morph.setXYZ(i, morph.getX(i) + 0.8, morph.getY(i), morph.getZ(i) + 5);
  geometry.morphAttributes.position = [morph];
  const material = new MeshBasicMaterial(); const mesh = new InstancedMesh(geometry, material, 1);
  const source = new Mesh(geometry, material); source.morphTargetInfluences![0] = 1; mesh.setMorphAt(0, source);
  const scene = new Scene(); scene.add(mesh);
  const result = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
  expect(result.safe).toBe(false); expect(result.position.z).toBeCloseTo(4.1);
  mesh.dispose(); geometry.dispose(); material.dispose();
});

test('triangle contact agrees with independent convex-distance minimization over seeded orientations', () => {
  let seed = 891;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const vector = () => new Vector3((random() - 0.5) * 8, (random() - 0.5) * 8, (random() - 0.5) * 8);
  const center = new Vector3(); const closest = new Vector3(); const contact = new Vector3();
  for (let i = 0; i < 200; i++) {
    const surface = new Triangle(vector(), vector(), vector());
    const ray = new Ray(vector(), vector().normalize()); const radius = 0.1 + random(); const length = 12;
    const distance = (time: number) => {
      ray.at(time, center); surface.closestPointToPoint(center, closest); return center.distanceTo(closest);
    };
    let lo = 0; let hi = length;
    for (let j = 0; j < 70; j++) {
      const a = lo + (hi - lo) / 3; const b = hi - (hi - lo) / 3;
      if (distance(a) < distance(b)) hi = b; else lo = a;
    }
    let expected = Infinity;
    if (distance(0) <= radius) expected = 0;
    else if (distance((lo + hi) / 2) <= radius) {
      hi = (lo + hi) / 2; lo = 0;
      for (let j = 0; j < 70; j++) { const mid = (lo + hi) / 2; if (distance(mid) <= radius) hi = mid; else lo = mid; }
      expected = hi;
    }
    const actual = sweepSphereTriangle(ray, radius, surface, length, contact);
    if (expected === Infinity) expect(actual).toBe(Infinity);
    else expect(actual).toBeCloseTo(expected, 6);
  }
});
