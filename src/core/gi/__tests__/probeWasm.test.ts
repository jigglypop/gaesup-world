import fs from 'fs';
import path from 'path';

import { ProbeCascade, createVoxelGrid, fillVoxelBox, registerVoxelMaterial } from '../index';
import type { GiEnvironment, GiWasmExports, ProbeVolumeConfig, VoxelGrid } from '../index';
import { instantiateGiWasm } from '../core/giWasm';

const WASM_PATH = path.resolve(process.cwd(), 'public', 'wasm', 'gaesup_gi.wasm');
const TOLERANCE = 1e-5;

const SUNLIT: GiEnvironment = {
  sunDirection: { x: 0.45, y: 0.4, z: 0.8 },
  sunIrradiance: [3, 2.8, 2.5],
  skyZenith: [0.35, 0.55, 0.95],
  skyHorizon: [0.75, 0.8, 0.85],
  skyGround: [0.18, 0.16, 0.14],
};

function createScene(): VoxelGrid {
  const grid = createVoxelGrid({ x: -4, y: -4, z: -4 }, 0.5, [40, 28, 40]);
  const wall = registerVoxelMaterial(grid, { albedo: [0.8, 0.78, 0.72], emissive: [0, 0, 0] });
  const red = registerVoxelMaterial(grid, { albedo: [0.7, 0.1, 0.08], emissive: [0, 0, 0] });
  const lamp = registerVoxelMaterial(grid, { albedo: [0.1, 0.1, 0.1], emissive: [3, 2, 1] });
  const box = (min: [number, number, number], max: [number, number, number], id: number) =>
    fillVoxelBox(
      grid,
      { min: { x: min[0], y: min[1], z: min[2] }, max: { x: max[0], y: max[1], z: max[2] } },
      id,
    );
  box([-4, -1, -4], [16, 0, 16], wall);
  box([0, 0, 0], [0.5, 4, 12], red);
  box([11.5, 0, 0], [12, 4, 12], wall);
  box([0, 0, 0], [12, 4, 0.5], wall);
  box([0, 0, 11.5], [4, 4, 12], wall);
  box([8, 0, 11.5], [12, 4, 12], wall);
  box([0, 3.5, 0], [12, 4, 12], wall);
  box([5, 0, 5], [5.5, 0.5, 5.5], lamp);
  return grid;
}

function coarseConfig(): ProbeVolumeConfig {
  return {
    origin: { x: -3, y: 0.5, z: -3 },
    spacing: 2,
    counts: [10, 5, 10],
    raysPerProbe: 32,
    blend: 0.2,
    normalBias: 0.75,
    maxRayDistance: 64,
  };
}

function fineConfig(): ProbeVolumeConfig {
  return { ...coarseConfig(), origin: { x: 0.5, y: 0.5, z: 0.5 }, spacing: 1, counts: [12, 4, 12] };
}

async function loadWasm(): Promise<GiWasmExports> {
  const wasm = await instantiateGiWasm(fs.readFileSync(WASM_PATH));
  if (!wasm) throw new Error('gaesup_gi.wasm could not be instantiated');
  return wasm;
}

function run(cascade: ProbeCascade, frames: number, budget: number): void {
  for (let frame = 0; frame < frames; frame++) cascade.update(budget);
}

function maxRelativeDifference(a: ProbeCascade, b: ProbeCascade): number {
  let peak = 0;
  let difference = 0;
  a.levels.forEach((level, index) => {
    const left = level.exportFaceData();
    const right = b.levels[index]?.exportFaceData();
    left.forEach((face, faceIndex) => {
      const other = right?.[faceIndex];
      face.forEach((value, texel) => {
        peak = Math.max(peak, Math.abs(value));
        difference = Math.max(difference, Math.abs(value - (other?.[texel] ?? Infinity)));
      });
    });
  });
  return difference / Math.max(peak, 1e-6);
}

describe('GI WASM 프로브 커널', () => {
  it('커밋된 바이너리를 불러오고 필요한 함수를 내보낸다', async () => {
    const wasm = await loadWasm();

    expect(wasm.memory).toBeInstanceOf(WebAssembly.Memory);
    expect(typeof wasm.gi_update_probes).toBe('function');
    expect(await instantiateGiWasm(new Uint8Array([0, 1, 2, 3]))).toBeNull();
  });

  it('같은 장면을 JS 경로와 같은 값으로 갱신한다', async () => {
    const js = new ProbeCascade(createScene(), coarseConfig(), fineConfig(), SUNLIT);
    const native = new ProbeCascade(createScene(), coarseConfig(), fineConfig(), SUNLIT);
    native.attachWasm(await loadWasm());

    expect(native.usesWasm).toBe(true);
    expect(js.usesWasm).toBe(false);
    run(js, 40, 64);
    run(native, 40, 64);

    expect(maxRelativeDifference(js, native)).toBeLessThan(TOLERANCE);
    js.levels.forEach((level, index) => {
      for (let probe = 0; probe < level.probeCount; probe++) {
        expect(native.levels[index]?.isProbeValid(probe)).toBe(level.isProbeValid(probe));
      }
    });
    expect(native.version).toBe(js.version);
  });

  it('도중에 붙여도 기존 값을 이어 받고 격자와 환경 변경을 따라간다', async () => {
    const gridJs = createScene();
    const gridNative = createScene();
    const js = new ProbeCascade(gridJs, coarseConfig(), fineConfig(), SUNLIT);
    const native = new ProbeCascade(gridNative, coarseConfig(), fineConfig(), SUNLIT);
    run(js, 12, 64);
    run(native, 12, 64);
    native.attachWasm(await loadWasm());
    expect(maxRelativeDifference(js, native)).toBe(0);

    for (const grid of [gridJs, gridNative]) {
      const glow = registerVoxelMaterial(grid, { albedo: [0, 0, 0], emissive: [6, 6, 6] });
      fillVoxelBox(grid, { min: { x: 8, y: 0, z: 3 }, max: { x: 9, y: 1, z: 4 } }, glow);
    }
    const box = { min: { x: 8, y: 0, z: 3 }, max: { x: 9, y: 1, z: 4 } };
    js.markDirtyBox(box);
    native.markDirtyBox(box);
    const dusk: GiEnvironment = { ...SUNLIT, sunDirection: { x: -0.6, y: 0.2, z: 0.3 } };
    js.setEnvironment(dusk);
    native.setEnvironment(dusk);
    run(js, 30, 64);
    run(native, 30, 64);

    expect(maxRelativeDifference(js, native)).toBeLessThan(TOLERANCE);
  });
});
