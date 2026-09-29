import { ProbeCascade, createVoxelGrid, fillVoxelBox, registerVoxelMaterial } from '../index';
import type {
  GiEnvironment,
  MutableRgb,
  ProbeVolume,
  ProbeVolumeConfig,
  VoxelGrid,
} from '../index';

const ZERO = { x: 0, y: 0, z: 0 };
const DARK: GiEnvironment = {
  sunDirection: { x: 0, y: 1, z: 0 },
  sunIrradiance: [0, 0, 0],
  skyZenith: [0, 0, 0],
  skyHorizon: [0, 0, 0],
  skyGround: [0, 0, 0],
};

function coarseConfig(): ProbeVolumeConfig {
  return {
    origin: { x: 1, y: 1, z: 1 },
    spacing: 2,
    counts: [5, 5, 5],
    raysPerProbe: 64,
    blend: 1,
    normalBias: 0.75,
    maxRayDistance: 100,
  };
}

function fineConfig(): ProbeVolumeConfig {
  return {
    origin: { x: 2.5, y: 2.5, z: 2.5 },
    spacing: 1,
    counts: [5, 5, 5],
    raysPerProbe: 64,
    blend: 1,
    normalBias: 0.75,
    maxRayDistance: 100,
  };
}

function uniformSky(value: number): GiEnvironment {
  return {
    ...DARK,
    skyZenith: [value, value, value],
    skyHorizon: [value, value, value],
    skyGround: [value, value, value],
  };
}

function createSealedRoom(): VoxelGrid {
  const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
  const id = registerVoxelMaterial(grid, { albedo: [0.5, 0.5, 0.5], emissive: [0.2, 0.2, 0.2] });
  const size = 10;
  for (const [min, max] of [
    [ZERO, { x: 1, y: size, z: size }],
    [
      { x: 9, y: 0, z: 0 },
      { x: size, y: size, z: size },
    ],
    [ZERO, { x: size, y: 1, z: size }],
    [
      { x: 0, y: 9, z: 0 },
      { x: size, y: size, z: size },
    ],
    [ZERO, { x: size, y: size, z: 1 }],
    [
      { x: 0, y: 0, z: 9 },
      { x: size, y: size, z: size },
    ],
  ] as const) {
    fillVoxelBox(grid, { min, max }, id);
  }
  return grid;
}

function stub(volume: ProbeVolume, value: number): void {
  Object.assign(volume, {
    sampleInto: (
      _px: number,
      _py: number,
      _pz: number,
      _nx: number,
      _ny: number,
      _nz: number,
      out: MutableRgb,
    ) => {
      out[0] = value;
      out[1] = value;
      out[2] = value;
    },
  });
}

function sweep(cascade: ProbeCascade, count: number): void {
  for (let index = 0; index < count; index++) cascade.update(cascade.probeCount);
}

const UP = { x: 0, y: 1, z: 0 };

describe('프로브 캐스케이드', () => {
  it('촘촘한 볼륨이 없으면 성긴 볼륨과 같은 값을 반환하고 혼합 가중치는 0이다', () => {
    const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const cascade = new ProbeCascade(grid, coarseConfig(), null, uniformSky(0.6));
    sweep(cascade, 1);

    const point = { x: 5, y: 5, z: 5 };

    expect(cascade.fine).toBeNull();
    expect(cascade.levels).toHaveLength(1);
    expect(cascade.fineWeight(5, 5, 5)).toBe(0);
    expect(cascade.sample(point, UP)).toEqual(cascade.coarse.sample(point, UP));
  });

  it('혼합 가중치는 촘촘한 영역 안에서 1, 밖에서 0이고 경계에서 간격만큼 서서히 변한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const cascade = new ProbeCascade(grid, coarseConfig(), fineConfig(), DARK);

    expect(cascade.fineWeight(4.5, 4.5, 4.5)).toBe(1);
    expect(cascade.fineWeight(2.5, 4.5, 4.5)).toBe(0);
    expect(cascade.fineWeight(3, 4.5, 4.5)).toBeCloseTo(0.5, 9);
    expect(cascade.fineWeight(3.5, 4.5, 4.5)).toBe(1);
    expect(cascade.fineWeight(0, 0, 0)).toBe(0);
    expect(cascade.fineWeight(9, 4.5, 4.5)).toBe(0);
  });

  it('샘플은 안쪽에서 촘촘한 값, 밖에서 성긴 값이며 경계에서는 가중치대로 섞인다', () => {
    const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const cascade = new ProbeCascade(grid, coarseConfig(), fineConfig(), DARK);
    stub(cascade.coarse, 3);
    if (cascade.fine) stub(cascade.fine, 1);

    expect(cascade.sample({ x: 4.5, y: 4.5, z: 4.5 }, UP)[0]).toBe(1);
    expect(cascade.sample({ x: 1, y: 1, z: 1 }, UP)[0]).toBe(3);
    expect(cascade.sample({ x: 3, y: 4.5, z: 4.5 }, UP)[0]).toBeCloseTo(2, 9);
  });

  it('갱신 예산은 두 레벨의 프로브 수 비율로 나뉘고 총 처리량은 예산을 넘지 않는다', () => {
    const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const cascade = new ProbeCascade(grid, coarseConfig(), fineConfig(), DARK);
    const total = cascade.probeCount;

    expect(total).toBe(250);
    expect(cascade.update(0)).toBe(0);
    expect(cascade.version).toBe(0);
    expect(cascade.update(10)).toBe(10);
    expect(cascade.coarse.version).toBe(1);
    expect(cascade.fine?.version).toBe(1);
    expect(cascade.update(total * 2)).toBe(total);
  });

  it('두 레벨이 히트 지점 되먹임을 공유해 밀폐된 방에서 e / (1 - albedo)로 수렴한다', () => {
    const cascade = new ProbeCascade(createSealedRoom(), coarseConfig(), fineConfig(), DARK);

    sweep(cascade, 16);

    for (const point of [
      { x: 5, y: 5, z: 5 },
      { x: 3.4, y: 4.2, z: 5.1 },
      { x: 7.5, y: 2.6, z: 4 },
    ]) {
      for (const channel of cascade.sample(point, UP)) {
        expect(Math.abs(channel - 0.4)).toBeLessThan(0.03);
      }
    }
  });

  it('환경과 더러움 표시가 두 레벨 모두에 전달된다', () => {
    const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const cascade = new ProbeCascade(grid, coarseConfig(), fineConfig(), uniformSky(0.2));
    sweep(cascade, 1);

    cascade.setEnvironment(uniformSky(0.6));
    cascade.markAllDirty();
    sweep(cascade, 1);

    for (const point of [
      { x: 5, y: 5, z: 5 },
      { x: 1.2, y: 1.4, z: 1.6 },
    ]) {
      expect(Math.abs((cascade.sample(point, UP)[0] ?? 0) - 0.6)).toBeLessThan(0.02);
    }
  });
});
