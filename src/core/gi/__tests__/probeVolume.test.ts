import { ProbeVolume, createVoxelGrid, fillVoxelBox, registerVoxelMaterial } from '../index';
import type { GiEnvironment, ProbeVolumeConfig, VoxelGrid } from '../index';

const ZERO = { x: 0, y: 0, z: 0 };
const DARK: GiEnvironment = {
  sunDirection: { x: 0, y: 1, z: 0 },
  sunIrradiance: [0, 0, 0],
  skyZenith: [0, 0, 0],
  skyHorizon: [0, 0, 0],
  skyGround: [0, 0, 0],
};

function createConfig(overrides: Partial<ProbeVolumeConfig> = {}): ProbeVolumeConfig {
  return {
    origin: { x: 1, y: 1, z: 1 },
    spacing: 2,
    counts: [4, 4, 4],
    raysPerProbe: 128,
    blend: 1,
    normalBias: 0.75,
    maxRayDistance: 100,
    ...overrides,
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

function sweep(volume: ProbeVolume, count: number): void {
  for (let index = 0; index < count; index++) volume.update(volume.probeCount);
}

function fillSlab(
  grid: VoxelGrid,
  axis: 'x' | 'y' | 'z',
  from: number,
  to: number,
  id: number,
): void {
  const size = grid.dims[0] * grid.voxelSize;
  const min = { x: 0, y: 0, z: 0 };
  const max = { x: size, y: size, z: size };
  min[axis] = from;
  max[axis] = to;
  fillVoxelBox(grid, { min, max }, id);
}

function createSealedRoom(albedo: number, emissive: number): VoxelGrid {
  const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
  const id = registerVoxelMaterial(grid, {
    albedo: [albedo, albedo, albedo],
    emissive: [emissive, emissive, emissive],
  });
  for (const axis of ['x', 'y', 'z'] as const) {
    fillSlab(grid, axis, 0, 1, id);
    fillSlab(grid, axis, 9, 10, id);
  }
  return grid;
}

const NORMALS = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];

describe('프로브 볼륨', () => {
  it('유효하지 않은 설정은 예외를 던진다', () => {
    const grid = createVoxelGrid(ZERO, 1, [4, 4, 4]);
    const invalid: Array<Partial<ProbeVolumeConfig>> = [
      { spacing: 0 },
      { counts: [0, 2, 2] },
      { counts: [1.5, 2, 2] },
      { raysPerProbe: 0 },
      { blend: 0 },
      { blend: 1.5 },
      { normalBias: -1 },
      { maxRayDistance: 0 },
    ];

    for (const overrides of invalid) {
      expect(() => new ProbeVolume(grid, createConfig(overrides), DARK)).toThrow(
        '[ProbeVolume Error]',
      );
    }
  });

  it('균일한 하늘은 모든 법선에서 같은 간접광을 만든다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 8, 8]);
    const volume = new ProbeVolume(grid, createConfig(), uniformSky(0.6));

    sweep(volume, 1);

    for (const normal of NORMALS) {
      const irradiance = volume.sample({ x: 4, y: 4, z: 4 }, normal);
      for (const channel of irradiance) expect(Math.abs(channel - 0.6)).toBeLessThan(0.01);
    }
  });

  it('위쪽 반구 하늘은 위쪽 1, 옆쪽 0.5, 아래쪽 0의 조도를 만든다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 8, 8]);
    const volume = new ProbeVolume(grid, createConfig({ raysPerProbe: 512 }), {
      ...DARK,
      skyZenith: [1, 1, 1],
      skyHorizon: [1, 1, 1],
    });

    sweep(volume, 1);

    const center = { x: 4, y: 4, z: 4 };
    expect(Math.abs(volume.sample(center, { x: 0, y: 1, z: 0 })[0] - 1)).toBeLessThan(0.05);
    expect(Math.abs(volume.sample(center, { x: 0, y: -1, z: 0 })[0] - 0)).toBeLessThan(0.05);
    expect(Math.abs(volume.sample(center, { x: 1, y: 0, z: 0 })[0] - 0.5)).toBeLessThan(0.05);
    expect(Math.abs(volume.sample(center, { x: 0, y: 0, z: -1 })[0] - 0.5)).toBeLessThan(0.05);
  });

  it('밀폐된 방의 다중 바운스는 e / (1 - albedo)로 수렴한다', () => {
    const grid = createSealedRoom(0.5, 0.2);
    const volume = new ProbeVolume(grid, createConfig({ counts: [5, 5, 5] }), DARK);

    sweep(volume, 14);

    for (const normal of NORMALS) {
      const irradiance = volume.sample({ x: 5, y: 5, z: 5 }, normal);
      for (const channel of irradiance) expect(Math.abs(channel - 0.4)).toBeLessThan(0.02);
    }
  });

  it('벽 안에 묻힌 프로브는 유효하지 않고 내보내기에서 이웃 값으로 채워진다', () => {
    const grid = createSealedRoom(0.5, 0.2);
    const volume = new ProbeVolume(grid, createConfig({ counts: [5, 5, 5] }), DARK);
    sweep(volume, 14);

    const wallProbe = 4;
    const interiorProbe = 2 + 5 * (2 + 5 * 2);
    expect(volume.isProbeValid(wallProbe)).toBe(false);
    expect(volume.isProbeValid(interiorProbe)).toBe(true);

    const data = volume.exportFaceData();
    expect(data.length).toBe(6);
    expect(data[0].length).toBe(volume.probeCount * 4);
    for (const face of data) {
      expect(face[wallProbe * 4]).toBeGreaterThan(0.3);
      expect(face[interiorProbe * 4]).toBeGreaterThan(0.3);
      expect(face[wallProbe * 4 + 3]).toBe(1);
    }
  });

  it('직사광은 바닥을 밝히고 지붕이 있으면 막힌다', () => {
    const sunlit: GiEnvironment = { ...DARK, sunIrradiance: [Math.PI, Math.PI, Math.PI] };
    const open = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const floor = registerVoxelMaterial(open, { albedo: [0.5, 0.5, 0.5], emissive: [0, 0, 0] });
    fillSlab(open, 'y', 0, 1, floor);
    const openVolume = new ProbeVolume(open, createConfig(), sunlit);
    sweep(openVolume, 6);

    const probePoint = { x: 5, y: 2, z: 5 };
    const towardFloor = openVolume.sample(probePoint, { x: 0, y: -1, z: 0 })[0];
    const towardSky = openVolume.sample(probePoint, { x: 0, y: 1, z: 0 })[0];
    expect(towardFloor).toBeGreaterThan(0.35);
    expect(towardFloor).toBeLessThan(0.7);
    expect(towardSky).toBeLessThan(0.05);

    const roofed = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const roofFloor = registerVoxelMaterial(roofed, {
      albedo: [0.5, 0.5, 0.5],
      emissive: [0, 0, 0],
    });
    fillSlab(roofed, 'y', 0, 1, roofFloor);
    fillSlab(roofed, 'y', 9, 10, roofFloor);
    const roofedVolume = new ProbeVolume(roofed, createConfig(), sunlit);
    sweep(roofedVolume, 6);

    expect(roofedVolume.sample(probePoint, { x: 0, y: -1, z: 0 })[0]).toBeLessThan(0.01);
  });

  it('햇빛을 받은 붉은 벽은 근처 표면에 붉은 간접광을 만든다', () => {
    const grid = createVoxelGrid(ZERO, 1, [10, 10, 10]);
    const white = registerVoxelMaterial(grid, { albedo: [0.8, 0.8, 0.8], emissive: [0, 0, 0] });
    const red = registerVoxelMaterial(grid, { albedo: [0.8, 0.1, 0.1], emissive: [0, 0, 0] });
    fillSlab(grid, 'y', 0, 1, white);
    fillSlab(grid, 'x', 9, 10, red);
    const environment: GiEnvironment = {
      ...DARK,
      sunDirection: { x: -1, y: 0.5, z: 0 },
      sunIrradiance: [3, 3, 3],
    };
    const volume = new ProbeVolume(grid, createConfig(), environment);

    sweep(volume, 6);

    const [r, g, b] = volume.sample({ x: 7, y: 4, z: 5 }, { x: 1, y: 0, z: 0 });
    expect(r).toBeGreaterThan(g * 1.3);
    expect(r).toBeGreaterThan(b * 1.3);
  });

  it('더러워진 영역의 프로브만 우선 갱신한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [16, 16, 16]);
    const config = createConfig({ counts: [8, 8, 8], raysPerProbe: 32, blend: 0.1 });
    const volume = new ProbeVolume(grid, config, DARK);
    sweep(volume, 2);
    const before = volume.exportFaceData()[0].slice();
    const nearIndex = 0;
    const farIndex = volume.probeCount - 1;
    const nearBefore = before[nearIndex * 4] ?? 0;
    const farBefore = before[farIndex * 4] ?? 0;

    const emitter = registerVoxelMaterial(grid, { albedo: [0, 0, 0], emissive: [5, 5, 5] });
    const box = { min: { x: 2, y: 2, z: 2 }, max: { x: 3, y: 3, z: 3 } };
    fillVoxelBox(grid, box, emitter);
    volume.markDirtyBox(box);
    volume.update(64);
    const after = volume.exportFaceData()[0];

    expect(after[nearIndex * 4] ?? 0).toBeGreaterThan(nearBefore + 0.1);
    expect(after[farIndex * 4] ?? 0).toBe(farBefore);
  });

  it('같은 입력은 같은 결과를 만들고 갱신할 때마다 버전이 오른다', () => {
    const grid = createSealedRoom(0.5, 0.2);
    const first = new ProbeVolume(
      grid,
      createConfig({ counts: [5, 5, 5], raysPerProbe: 32 }),
      DARK,
    );
    const second = new ProbeVolume(
      grid,
      createConfig({ counts: [5, 5, 5], raysPerProbe: 32 }),
      DARK,
    );

    expect(first.version).toBe(0);
    sweep(first, 3);
    sweep(second, 3);

    expect(first.version).toBe(3);
    expect(first.exportFaceData()[2]).toEqual(second.exportFaceData()[2]);
  });

  it('갱신은 지수 이동평균으로 진행되어 첫 갱신은 전부 바꾸고 이후에는 blend 비율만 반영한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 8, 8]);
    const volume = new ProbeVolume(grid, createConfig({ blend: 0.25 }), uniformSky(0.2));
    const center = { x: 4, y: 4, z: 4 };
    const up = { x: 0, y: 1, z: 0 };

    sweep(volume, 1);
    expect(Math.abs((volume.sample(center, up)[0] ?? 0) - 0.2)).toBeLessThan(0.01);

    volume.setEnvironment(uniformSky(0.6));
    sweep(volume, 1);
    expect(Math.abs((volume.sample(center, up)[0] ?? 0) - 0.3)).toBeLessThan(0.02);

    sweep(volume, 1);
    expect(Math.abs((volume.sample(center, up)[0] ?? 0) - 0.375)).toBeLessThan(0.02);
  });

  it('NaN과 무한대가 섞인 환경과 재질도 프로브 값을 오염시키지 않는다', () => {
    const grid = createSealedRoom(0.5, NaN);
    const poisoned: GiEnvironment = {
      sunDirection: { x: NaN, y: NaN, z: NaN },
      sunIrradiance: [Infinity, NaN, -5],
      skyZenith: [NaN, Infinity, 1],
      skyHorizon: [NaN, NaN, NaN],
      skyGround: [-1, -1, -1],
    };
    const volume = new ProbeVolume(grid, createConfig({ counts: [5, 5, 5], blend: 1 }), poisoned);

    sweep(volume, 4);

    for (const face of volume.exportFaceData()) {
      for (const value of face) expect(Number.isFinite(value)).toBe(true);
    }
    for (const normal of NORMALS) {
      for (const channel of volume.sample({ x: 5, y: 5, z: 5 }, normal)) {
        expect(Number.isFinite(channel)).toBe(true);
      }
    }
  });

  it('알베도가 1을 넘어도 되먹임이 발산하지 않고 상한 0.95의 고정점으로 수렴한다', () => {
    const grid = createSealedRoom(3, 0.2);
    const volume = new ProbeVolume(grid, createConfig({ counts: [5, 5, 5], blend: 1 }), DARK);

    sweep(volume, 80);

    const irradiance = volume.sample({ x: 5, y: 5, z: 5 }, { x: 0, y: 1, z: 0 });
    for (const channel of irradiance) {
      expect(Number.isFinite(channel)).toBe(true);
      expect(channel).toBeLessThan(0.2 / (1 - 0.95) + 0.1);
      expect(channel).toBeGreaterThan(1);
    }
  });

  it('수렴한 뒤 반복 갱신해도 값이 크게 흔들리지 않는다', () => {
    const grid = createSealedRoom(0.5, 0.2);
    const volume = new ProbeVolume(
      grid,
      createConfig({ counts: [5, 5, 5], raysPerProbe: 32, blend: 0.2 }),
      DARK,
    );
    sweep(volume, 20);
    const point = { x: 5, y: 5, z: 5 };
    const readings: number[] = [];

    for (let index = 0; index < 20; index++) {
      sweep(volume, 1);
      readings.push(volume.sample(point, { x: 0, y: 1, z: 0 })[0] ?? 0);
    }

    const mean = readings.reduce((sum, value) => sum + value, 0) / readings.length;
    const spread = Math.max(...readings) - Math.min(...readings);
    expect(Math.abs(mean - 0.4)).toBeLessThan(0.02);
    expect(spread / mean).toBeLessThan(0.05);
  });

  it('볼륨 밖 좌표를 샘플링해도 유한한 값을 반환한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 8, 8]);
    const volume = new ProbeVolume(grid, createConfig(), uniformSky(0.6));
    sweep(volume, 1);

    const irradiance = volume.sample({ x: -50, y: 200, z: 30 }, { x: 0, y: 1, z: 0 });

    for (const channel of irradiance) {
      expect(Number.isFinite(channel)).toBe(true);
      expect(Math.abs(channel - 0.6)).toBeLessThan(0.02);
    }
  });
});
