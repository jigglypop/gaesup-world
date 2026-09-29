import {
  PROBE_ATLAS_ALPHA,
  PROBE_ATLAS_CHANNELS,
  PROBE_ATLAS_FACES,
  probeAtlasLength,
  probeAtlasOffset,
  takeProbeAtlas,
  toHalfFloat,
  writeFaceBuffersToAtlas,
} from '../core/probeAtlas';
import { ProbeVolume } from '../core/probeVolume';
import { createVoxelGrid, fillVoxelBox, registerVoxelMaterial } from '../index';
import type { GiEnvironment, ProbeVolumeConfig } from '../index';

/** Exact value of half-float bits, for checking the rounding. */
function fromHalf(bits: number): number {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >> 10) & 0x1f;
  const mantissa = bits & 0x3ff;
  if (exponent === 0) return sign * mantissa * 2 ** -24;
  if (exponent === 0x1f) return mantissa ? Number.NaN : sign * Infinity;
  return sign * (1 + mantissa / 1024) * 2 ** (exponent - 15);
}

const SUNLIT: GiEnvironment = {
  sunDirection: { x: 0.45, y: 0.7, z: 0.5 },
  sunIrradiance: [3, 2.8, 2.5],
  skyZenith: [0.35, 0.55, 0.95],
  skyHorizon: [0.75, 0.8, 0.85],
  skyGround: [0.18, 0.16, 0.14],
};

function createVolume(): ProbeVolume {
  const grid = createVoxelGrid({ x: -4, y: -2, z: -4 }, 0.5, [24, 16, 20]);
  const red = registerVoxelMaterial(grid, { albedo: [0.7, 0.1, 0.08], emissive: [0, 0, 0] });
  fillVoxelBox(grid, { min: { x: -4, y: -1, z: -4 }, max: { x: 8, y: 0, z: 6 } });
  fillVoxelBox(grid, { min: { x: 0, y: 0, z: 0 }, max: { x: 0.5, y: 3, z: 4 } }, red);
  const config: ProbeVolumeConfig = {
    origin: { x: -3, y: 0.5, z: -3 },
    spacing: 2,
    counts: [5, 3, 4],
    raysPerProbe: 16,
    blend: 0.2,
    normalBias: 0.5,
    maxRayDistance: 32,
  };
  return new ProbeVolume(grid, config, SUNLIT);
}

describe('프로브 아틀라스', () => {
  it('반정밀도 변환은 가장 가까운 값으로 반올림하고 범위 밖과 NaN을 유한한 값으로 바꾼다', () => {
    expect(toHalfFloat(0)).toBe(0);
    expect(toHalfFloat(1)).toBe(0x3c00);
    expect(toHalfFloat(-2)).toBe(0xc000);
    expect(toHalfFloat(65504)).toBe(0x7bff);
    expect(toHalfFloat(1e9)).toBe(0x7bff);
    expect(toHalfFloat(Infinity)).toBe(0x7bff);
    expect(toHalfFloat(Number.NaN)).toBe(0);
    expect(toHalfFloat(2 ** -24)).toBe(1);
    expect(toHalfFloat(2 ** -26)).toBe(0);
    // Values reach the atlas as float32 (the probe cubes are Float32Array), so rounding is checked from there.
    for (let i = 0; i < 2000; i++) {
      const value = Math.fround(Math.exp((i / 2000) * 24 - 16) * (i % 2 ? 1 : 0.73));
      const decoded = fromHalf(toHalfFloat(value));
      const ulp = value >= 2 ** -14 ? 2 ** (Math.floor(Math.log2(value)) - 10) : 2 ** -24;
      expect(Math.abs(decoded - value)).toBeLessThanOrEqual(ulp / 2);
    }
  });

  it('프로브 한 줄에 여섯 면을 x로 이어 붙인 배치를 쓴다', () => {
    const counts = [3, 2, 2] as const;
    expect(probeAtlasLength(counts)).toBe(3 * 2 * 2 * PROBE_ATLAS_FACES * PROBE_ATLAS_CHANNELS);
    // Probe (1, 1, 0) is row 1; its -y face (face 3) starts three face-widths into the row.
    expect(probeAtlasOffset(counts, 4, 3)).toBe(((1 * PROBE_ATLAS_FACES + 3) * 3 + 1) * PROBE_ATLAS_CHANNELS);
  });

  it('packAtlas는 면별 버퍼를 거친 기존 경로와 같은 비트를 쓴다', () => {
    const volume = createVolume();
    for (let frame = 0; frame < 6; frame++) volume.update(20);
    const { counts } = volume.config;
    const legacy = new Uint16Array(probeAtlasLength(counts));
    writeFaceBuffersToAtlas(legacy, counts, volume.exportFaceData());
    const packed = new Uint16Array(probeAtlasLength(counts));
    volume.packAtlas(packed);

    expect(Array.from(packed)).toEqual(Array.from(legacy));
    expect(packed[probeAtlasOffset(counts, 7, 2) + 3]).toBe(PROBE_ATLAS_ALPHA);
    expect(packed.some((bits, index) => index % 4 !== 3 && bits !== 0)).toBe(true);
    expect(() => volume.packAtlas(new Uint16Array(8))).toThrow(RangeError);
  });

  it('맞는 길이의 예비 배열을 꺼내 쓰고 없으면 새로 만든다', () => {
    const small = new Uint16Array(8);
    const large = new Uint16Array(16);
    const pool = [small, large];

    expect(takeProbeAtlas(pool, 16)).toBe(large);
    expect(pool).toEqual([small]);
    const fresh = takeProbeAtlas(pool, 32);
    expect(fresh).toHaveLength(32);
    expect(pool).toEqual([small]);
  });
});
