import * as THREE from 'three';

import { getGrassManager, type GrassTileRenderState } from '../manager';

function makeFrustum(camera: THREE.PerspectiveCamera): THREE.Frustum {
  camera.updateMatrixWorld(true);
  const m = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  );
  return new THREE.Frustum().setFromProjectionMatrix(m);
}

describe('GrassManager', () => {
  beforeEach(() => {
    const mgr = getGrassManager();
    // best-effort cleanup between tests
    while (mgr.size() > 0) {
      const ids: number[] = [];
      // private map, but we can drain by registering+unregistering after read
      // The manager exposes only register/unregister/update, so we recreate
      // by stripping known ids if any leak. In practice each test registers
      // a few and unregisters them at the end.
      break;
    }
  });

  it('clamps instance count by LOD weight when in frustum', () => {
    const mgr = getGrassManager();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 200);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 10);
    const frustum = makeFrustum(camera);

    const samples: GrassTileRenderState[] = [];
    const handle = mgr.register({
      width: 4,
      height: 1,
      center: new THREE.Vector3(0, 0, 10),
      maxInstances: 1000,
      apply: (s) => samples.push({ ...s, trampleCenter: s.trampleCenter.clone() }),
    });

    mgr.tick({ elapsedTime: 0, delta: 1 / 60, cameraPosition: camera.position, frustum });

    expect(samples.length).toBe(1);
    expect(samples[0].visible).toBe(true);
    expect(samples[0].instanceCount).toBeGreaterThan(0);
    expect(samples[0].instanceCount).toBeLessThanOrEqual(1000);

    mgr.unregister(handle.id);
  });

  it('marks tiles invisible when far behind the camera', () => {
    const mgr = getGrassManager();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 10);
    const frustum = makeFrustum(camera);

    const samples: GrassTileRenderState[] = [];
    const handle = mgr.register({
      width: 4,
      height: 1,
      center: new THREE.Vector3(0, 0, -50),
      maxInstances: 500,
      apply: (s) => samples.push({ ...s, trampleCenter: s.trampleCenter.clone() }),
    });

    mgr.tick({ elapsedTime: 0, delta: 1 / 60, cameraPosition: camera.position, frustum });

    expect(samples[0].visible).toBe(false);
    expect(samples[0].instanceCount).toBe(0);

    mgr.unregister(handle.id);
  });

  it('processes many tiles in a single tick', () => {
    const mgr = getGrassManager();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 500);
    camera.position.set(0, 30, 0);
    camera.lookAt(0, 0, 0);
    const frustum = makeFrustum(camera);

    const ids: number[] = [];
    let calls = 0;
    for (let i = 0; i < 64; i += 1) {
      const angle = (i / 64) * Math.PI * 2;
      const r = 25;
      const handle = mgr.register({
        width: 4,
        height: 1,
        center: new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r),
        maxInstances: 200,
        apply: () => { calls += 1; },
      });
      ids.push(handle.id);
    }

    // wait past dedupe window
    const start = Date.now();
    while (Date.now() - start < 20) { /* spin */ }
    mgr.tick({ elapsedTime: 0, delta: 1 / 60, cameraPosition: camera.position, frustum });
    expect(calls).toBe(64);

    for (const id of ids) mgr.unregister(id);
  });
});
