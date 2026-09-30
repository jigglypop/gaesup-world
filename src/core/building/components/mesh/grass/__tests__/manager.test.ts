import * as THREE from 'three';

import { climateTargets, createClimateState } from '../../../../../weather/core/climate';
import { resetWeatherField, windSway, writeWeatherField } from '../../../../../weather/core/field';
import { getGrassManager, type GrassTileRenderState } from '../manager';

function makeFrustum(camera: THREE.PerspectiveCamera): THREE.Frustum {
  camera.updateMatrixWorld(true);
  const m = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  );
  return new THREE.Frustum().setFromProjectionMatrix(m);
}

function singleSample(samples: GrassTileRenderState[]): GrassTileRenderState {
  expect(samples).toHaveLength(1);
  const [sample] = samples;
  if (!sample) throw new Error('expected exactly one grass render sample');
  return sample;
}

describe('GrassManager', () => {
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

    const sample = singleSample(samples);
    expect(sample.visible).toBe(true);
    expect(sample.instanceCount).toBeGreaterThan(0);
    expect(sample.instanceCount).toBeLessThanOrEqual(1000);

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

    const sample = singleSample(samples);
    expect(sample.visible).toBe(false);
    expect(sample.instanceCount).toBe(0);

    mgr.unregister(handle.id);
  });

  it('honors per-tile LOD overrides', () => {
    const mgr = getGrassManager();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 500);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 50);
    const frustum = makeFrustum(camera);

    const samples: GrassTileRenderState[] = [];
    const handle = mgr.register({
      width: 4,
      height: 1,
      center: new THREE.Vector3(0, 0, 50),
      maxInstances: 1000,
      lod: { near: 1, far: 10, strength: 1 },
      apply: (s) => samples.push({ ...s, trampleCenter: s.trampleCenter.clone() }),
    });

    mgr.tick({ elapsedTime: 0, delta: 1 / 60, cameraPosition: camera.position, frustum });

    const sample = singleSample(samples);
    expect(sample.visible).toBe(false);
    expect(sample.instanceCount).toBe(0);

    mgr.unregister(handle.id);
  });

  it('sways with the live wind, harder in a storm than on a calm day', () => {
    const mgr = getGrassManager();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 200);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 10);
    const frustum = makeFrustum(camera);
    const samples: GrassTileRenderState[] = [];
    const handle = mgr.register({
      width: 4, height: 1, center: new THREE.Vector3(0, 0, 10), maxInstances: 100, apply: (s) => samples.push({ ...s }),
    });
    try {
      mgr.tick({ elapsedTime: 1, delta: 1 / 60, cameraPosition: camera.position, frustum });
      writeWeatherField(createClimateState(climateTargets('storm', 1)));
      mgr.tick({ elapsedTime: 2, delta: 1 / 60, cameraPosition: camera.position, frustum });
      const [calm, storm] = samples;
      expect(calm!.windScale).toBeCloseTo(0.92);
      expect(storm!.windScale).toBeCloseTo(windSway());
      expect(storm!.windScale).toBeGreaterThan(calm!.windScale * 2);
    } finally {
      resetWeatherField();
      mgr.unregister(handle.id);
    }
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

    mgr.tick({ elapsedTime: 0, delta: 1 / 60, cameraPosition: camera.position, frustum });
    expect(calls).toBe(64);

    for (const id of ids) mgr.unregister(id);
  });
});
