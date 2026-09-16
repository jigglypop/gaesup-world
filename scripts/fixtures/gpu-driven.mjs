import {
  AmbientLight,
  BoxGeometry,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGPUCoordinateSystem,
} from 'three';
import { WebGPURenderer } from 'three/webgpu';

import {
  createGpuDrivenInstances,
  cullAndCompactSpheres,
  extractFrustumPlanes,
} from 'gaesup-world/next';

async function run() {
  const renderer = new WebGPURenderer({ canvas: document.querySelector('#gpu') });
  await renderer.init();
  if (!renderer.backend.isWebGPUBackend) throw new Error('Native WebGPU required for this probe.');
  renderer.setSize(640, 480);
  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 3));
  const camera = new PerspectiveCamera(60, 640 / 480, 0.1, 100);
  camera.coordinateSystem = WebGPUCoordinateSystem;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const geometry = new BoxGeometry();
  const positions = new Float32Array([0, 0, -8, 2, 1, -10, 300, 0, -10, 0, 0, 5, 0, 0, -130]);
  const planes = new Float32Array(24);
  const indices = new Uint32Array(5);
  const projection = new Matrix4();
  const results = [];
  renderer.render(scene, camera);
  const before = renderer.info.memory.geometries;
  for (let cycle = 0; cycle < 3; cycle += 1) {
    const group = await createGpuDrivenInstances({ renderer, geometry, positions, radius: 0.87 });
    if (!group) throw new Error('GPU instance creation was unavailable.');
    scene.add(group.mesh);
    const samples = [];
    for (const rotation of [0, Math.PI, 0]) {
      camera.rotation.y = rotation;
      camera.updateMatrixWorld();
      projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      extractFrustumPlanes(new Float32Array(projection.elements), planes, true);
      const expected = cullAndCompactSpheres(planes, positions, 0.87, 5, indices);
      group.update(planes);
      renderer.render(scene, camera);
      const visible = await group.readVisibleCount();
      if (visible !== expected) throw new Error(`GPU/CPU mismatch: ${visible} !== ${expected}`);
      samples.push({ expected, visible });
    }
    const attributes = [group.mesh.geometry.indirect];
    const buffer = renderer.backend.get(attributes[0]).buffer;
    let destroys = 0;
    const destroy = buffer.destroy.bind(buffer);
    buffer.destroy = () => {
      destroys += 1;
      destroy();
    };
    group.dispose();
    group.dispose();
    if (destroys !== 1) throw new Error(`Indirect buffer disposed ${destroys} times.`);
    results.push({ samples, destroys, geometries: renderer.info.memory.geometries });
    if (
      renderer.info.memory.storageAttributes !== 0 ||
      renderer.info.memory.indirectStorageAttributes !== 0
    ) {
      throw new Error(`Storage buffers leaked: ${JSON.stringify(renderer.info.memory)}`);
    }
  }
  if (renderer.info.memory.geometries !== before)
    throw new Error('Geometry count grew across disposal.');
  // Zero-visible and non-indexed geometry exercise distinct indirect layouts.
  const nonIndexed = geometry.toNonIndexed();
  const emptyView = await createGpuDrivenInstances({
    renderer,
    geometry: nonIndexed,
    positions: new Float32Array([500, 500, -10]),
    radius: 0.87,
  });
  scene.add(emptyView.mesh);
  emptyView.update(planes);
  renderer.render(scene, camera);
  const zeroCount = await emptyView.readVisibleCount();
  if (zeroCount !== 0) throw new Error('Empty frustum did not submit zero instances.');
  emptyView.dispose();
  const drawRanges = [];
  for (const ranged of [geometry.clone(), geometry.toNonIndexed()]) {
    const total = ranged.index?.count ?? ranged.getAttribute('position').count;
    for (const [start, length] of [
      [3, 6],
      [999, 3],
      [0, 0],
    ]) {
      ranged.setDrawRange(start, length);
      const group = await createGpuDrivenInstances({
        renderer,
        geometry: ranged,
        positions,
        radius: 0.87,
      });
      scene.add(group.mesh);
      group.update(planes);
      renderer.render(scene, camera);
      const args = new Uint32Array(
        await renderer.getArrayBufferAsync(group.mesh.geometry.indirect),
      );
      const expectedStart = Math.min(start, total);
      if (args[0] !== Math.min(length, total - expectedStart) || args[2] !== expectedStart) {
        throw new Error(`Incorrect indirect draw range: ${args}`);
      }
      drawRanges.push({ indexed: ranged.index !== null, start: args[2], count: args[0] });
      group.dispose();
    }
    ranged.dispose();
  }
  nonIndexed.dispose();
  geometry.dispose();
  renderer.dispose();
  return { native: true, results, zeroCount, drawRanges };
}
window.probe = run()
  .then((result) => ({ result }))
  .catch((error) => ({ error: String(error.stack ?? error) }));
