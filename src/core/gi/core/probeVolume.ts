import type { Vec3 } from '../../grid';
import type {
  Aabb,
  GiEnvironment,
  Mat3,
  MutableRgb,
  ProbeFaceBuffers,
  ProbeVolumeConfig,
  Rgb,
  VoxelGrid,
  VoxelMaterial,
} from '../types';
import {
  CUBE_CHANNELS,
  CUBE_FACE_COUNT,
  CUBE_STRIDE,
  accumulateAmbientCube,
  evaluateAmbientCube,
} from './cube';
import { fibonacciSphereDirection, r2Sample, rotationFromSample } from './sampling';
import { createVoxelHitScratch, traceVoxelRayInto } from './traceVoxels';
import { isVoxelOccupied, voxelMaterialId } from './voxelGrid';

type Channel = 0 | 1 | 2;

const CHANNELS: readonly Channel[] = [0, 1, 2];
const TEXEL_STRIDE = 4;
const MAX_PROBE_COUNT = 1 << 22;
const IRRADIANCE_ESTIMATOR_SCALE = 4;
const INVERSE_PI = 1 / Math.PI;
const GOLDEN_FRACTION = 0.6180339887498949;
const CONTACT_BIAS_RATIO = 1e-3;
const BACKFACE_FLOOR = 0.2;
const HALF = 0.5;
const WEIGHT_EPSILON = 1e-6;
const DISTANCE_EPSILON = 1e-6;
const DIRTY_MARGIN_SPACINGS = 2;
const RADIANCE_LIMIT = 64;
const IRRADIANCE_LIMIT = 1024;
const ALBEDO_LIMIT = 0.95;
const FALLBACK_SUN: Vec3 = { x: 0, y: 1, z: 0 };
const MISSING_MATERIAL: VoxelMaterial = { albedo: [0, 0, 0], emissive: [0, 0, 0] };

function validateConfig(config: ProbeVolumeConfig): void {
  const { origin, spacing, counts, raysPerProbe, blend, normalBias, maxRayDistance } = config;
  if (![origin.x, origin.y, origin.z, spacing, normalBias, maxRayDistance].every(Number.isFinite)) {
    throw new RangeError('[ProbeVolume Error]: config values must be finite');
  }
  if (spacing <= 0 || normalBias < 0 || maxRayDistance <= 0) {
    throw new RangeError('[ProbeVolume Error]: spacing and maxRayDistance must be positive');
  }
  if (!counts.every((count) => Number.isInteger(count) && count > 0)) {
    throw new RangeError('[ProbeVolume Error]: counts must be positive integers');
  }
  if (counts[0] * counts[1] * counts[2] > MAX_PROBE_COUNT) {
    throw new RangeError('[ProbeVolume Error]: probe count exceeds the limit');
  }
  if (!Number.isInteger(raysPerProbe) || raysPerProbe < 1) {
    throw new RangeError('[ProbeVolume Error]: raysPerProbe must be a positive integer');
  }
  if (!(blend > 0 && blend <= 1)) {
    throw new RangeError('[ProbeVolume Error]: blend must be within (0, 1]');
  }
}

function clampFinite(value: number, limit: number): number {
  if (!(value > 0)) return 0;
  return value < limit ? value : limit;
}

function sanitizeRgb(color: Rgb, limit: number): Rgb {
  return [
    clampFinite(color[0], limit),
    clampFinite(color[1], limit),
    clampFinite(color[2], limit),
  ];
}

function normalizeEnvironment(environment: GiEnvironment): GiEnvironment {
  const { x, y, z } = environment.sunDirection;
  const length = Math.hypot(x, y, z);
  const usable = Number.isFinite(length) && length > DISTANCE_EPSILON;
  return {
    sunDirection: usable ? { x: x / length, y: y / length, z: z / length } : FALLBACK_SUN,
    sunIrradiance: sanitizeRgb(environment.sunIrradiance, IRRADIANCE_LIMIT),
    skyZenith: sanitizeRgb(environment.skyZenith, RADIANCE_LIMIT),
    skyHorizon: sanitizeRgb(environment.skyHorizon, RADIANCE_LIMIT),
    skyGround: sanitizeRgb(environment.skyGround, RADIANCE_LIMIT),
  };
}

function skyRadianceInto(environment: GiEnvironment, dy: number, out: MutableRgb): void {
  const { skyZenith, skyHorizon, skyGround } = environment;
  if (dy < 0) {
    out[0] = skyGround[0];
    out[1] = skyGround[1];
    out[2] = skyGround[2];
    return;
  }
  const t = Math.min(1, dy);
  out[0] = skyHorizon[0] + (skyZenith[0] - skyHorizon[0]) * t;
  out[1] = skyHorizon[1] + (skyZenith[1] - skyHorizon[1]) * t;
  out[2] = skyHorizon[2] + (skyZenith[2] - skyHorizon[2]) * t;
}

function cellFloor(coordinate: number, count: number): number {
  return count <= 1 ? 0 : Math.min(Math.max(Math.floor(coordinate), 0), count - 2);
}

function cellFraction(coordinate: number, cell: number, count: number): number {
  return count <= 1 ? 0 : Math.min(Math.max(coordinate - cell, 0), 1);
}

function probeRange(
  min: number,
  max: number,
  origin: number,
  spacing: number,
  margin: number,
  count: number,
): readonly [number, number] | null {
  const lo = Math.floor((min - margin - origin) / spacing);
  const hi = Math.ceil((max + margin - origin) / spacing);
  if (hi < 0 || lo > count - 1) return null;
  return [Math.max(lo, 0), Math.min(hi, count - 1)];
}

/**
 * 복셀 장면을 추적해 프로브 격자에 간접광(6방향 조도 큐브)을 누적하는 래디언스 캐시.
 * 프로브가 히트 지점 셰이딩에 이전 프레임의 프로브 값을 다시 사용하므로 다중 바운스가 시간에 걸쳐 수렴한다.
 * 알베도 상한 0.95와 방사휘도 상한으로 되먹임 이득이 항상 1보다 작아 값이 발산하거나 NaN으로 오염되지 않는다.
 */
export class ProbeVolume {
  readonly config: ProbeVolumeConfig;
  readonly probeCount: number;
  version = 0;
  private readonly grid: VoxelGrid;
  private environment: GiEnvironment;
  private readonly cube: Float32Array;
  private readonly valid: Uint8Array;
  private readonly age: Uint32Array;
  private readonly queued: Uint8Array;
  private readonly dirtyQueue: number[] = [];
  private dirtyHead = 0;
  private readonly baseDirections: Float64Array;
  private readonly accumulator = new Float64Array(CUBE_STRIDE);
  private readonly rotation: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  private readonly rayRadiance: MutableRgb = [0, 0, 0];
  private readonly fieldSample: MutableRgb = [0, 0, 0];
  private readonly cornerSample: MutableRgb = [0, 0, 0];
  private readonly rayHit = createVoxelHitScratch();
  private readonly shadowHit = createVoxelHitScratch();
  private cursor = 0;

  constructor(grid: VoxelGrid, config: ProbeVolumeConfig, environment: GiEnvironment) {
    validateConfig(config);
    this.grid = grid;
    this.config = { ...config, origin: { ...config.origin } };
    this.environment = normalizeEnvironment(environment);
    this.probeCount = config.counts[0] * config.counts[1] * config.counts[2];
    this.cube = new Float32Array(this.probeCount * CUBE_STRIDE);
    this.valid = new Uint8Array(this.probeCount);
    this.age = new Uint32Array(this.probeCount);
    this.queued = new Uint8Array(this.probeCount);
    this.baseDirections = new Float64Array(config.raysPerProbe * 3);
    for (let ray = 0; ray < config.raysPerProbe; ray++) {
      const direction = fibonacciSphereDirection(ray, config.raysPerProbe);
      this.baseDirections[ray * 3] = direction.x;
      this.baseDirections[ray * 3 + 1] = direction.y;
      this.baseDirections[ray * 3 + 2] = direction.z;
    }
  }

  setEnvironment(environment: GiEnvironment): void {
    this.environment = normalizeEnvironment(environment);
  }

  markAllDirty(): void {
    this.age.fill(0);
  }

  markDirtyBox(box: Aabb): void {
    const { origin, spacing, counts } = this.config;
    const margin = spacing * DIRTY_MARGIN_SPACINGS;
    const rangeX = probeRange(box.min.x, box.max.x, origin.x, spacing, margin, counts[0]);
    const rangeY = probeRange(box.min.y, box.max.y, origin.y, spacing, margin, counts[1]);
    const rangeZ = probeRange(box.min.z, box.max.z, origin.z, spacing, margin, counts[2]);
    if (!rangeX || !rangeY || !rangeZ) return;
    for (let iz = rangeZ[0]; iz <= rangeZ[1]; iz++) {
      for (let iy = rangeY[0]; iy <= rangeY[1]; iy++) {
        for (let ix = rangeX[0]; ix <= rangeX[1]; ix++) {
          const index = ix + counts[0] * (iy + counts[1] * iz);
          this.age[index] = 0;
          if (this.queued[index] === 1) continue;
          this.queued[index] = 1;
          this.dirtyQueue.push(index);
        }
      }
    }
  }

  isProbeValid(index: number): boolean {
    return this.valid[index] === 1;
  }

  probePosition(index: number, out: Vec3): void {
    const { origin, spacing, counts } = this.config;
    const layer = counts[0] * counts[1];
    out.x = origin.x + (index % counts[0]) * spacing;
    out.y = origin.y + (Math.floor(index / counts[0]) % counts[1]) * spacing;
    out.z = origin.z + Math.floor(index / layer) * spacing;
  }

  /**
   * probeBudget개의 프로브를 갱신한다. 더러워진 프로브를 먼저 처리하고 남는 예산은 전체를 순환하며 쓴다.
   */
  update(probeBudget: number): number {
    const budget = Math.min(Math.max(0, Math.floor(probeBudget)), this.probeCount);
    for (let processed = 0; processed < budget; processed++) {
      this.updateProbe(this.nextProbe());
    }
    if (budget > 0) this.version += 1;
    return budget;
  }

  sample(position: Vec3, normal: Vec3): Rgb {
    const out: MutableRgb = [0, 0, 0];
    this.sampleInto(position.x, position.y, position.z, normal.x, normal.y, normal.z, out);
    return out;
  }

  /**
   * 프로브별 조도 큐브를 면마다 RGBA 텍셀 버퍼 하나(면 6개)로 내보낸다. 알파는 항상 1이다.
   * 복셀 안에 묻힌 프로브는 이웃 유효 프로브 평균으로 채워 하드웨어 보간 시 어둡게 번지지 않게 한다.
   */
  exportFaceData(target?: ProbeFaceBuffers): ProbeFaceBuffers {
    const size = this.probeCount * TEXEL_STRIDE;
    const faces: ProbeFaceBuffers = target ?? [
      new Float32Array(size),
      new Float32Array(size),
      new Float32Array(size),
      new Float32Array(size),
      new Float32Array(size),
      new Float32Array(size),
    ];
    for (let index = 0; index < this.probeCount; index++) {
      if (this.valid[index] === 1) this.loadProbe(index);
      else this.loadDilated(index);
      for (let face = 0; face < CUBE_FACE_COUNT; face++) {
        const buffer = faces[face];
        if (!buffer) continue;
        const texel = index * TEXEL_STRIDE;
        for (const c of CHANNELS) {
          buffer[texel + c] = this.accumulator[face * CUBE_CHANNELS + c] ?? 0;
        }
        buffer[texel + CUBE_CHANNELS] = 1;
      }
    }
    return faces;
  }

  private loadProbe(index: number): void {
    const base = index * CUBE_STRIDE;
    for (let i = 0; i < CUBE_STRIDE; i++) this.accumulator[i] = this.cube[base + i] ?? 0;
  }

  private loadDilated(index: number): void {
    const { counts } = this.config;
    const layer = counts[0] * counts[1];
    const cx = index % counts[0];
    const cy = Math.floor(index / counts[0]) % counts[1];
    const cz = Math.floor(index / layer);
    this.accumulator.fill(0);
    let neighbors = 0;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          const nz = cz + dz;
          const outside = nx < 0 || ny < 0 || nz < 0;
          if (outside || nx >= counts[0] || ny >= counts[1] || nz >= counts[2]) continue;
          const neighbor = nx + counts[0] * (ny + counts[1] * nz);
          if (this.valid[neighbor] !== 1) continue;
          neighbors += 1;
          const base = neighbor * CUBE_STRIDE;
          for (let i = 0; i < CUBE_STRIDE; i++) {
            this.accumulator[i] = (this.accumulator[i] ?? 0) + (this.cube[base + i] ?? 0);
          }
        }
      }
    }
    if (neighbors === 0) return;
    for (let i = 0; i < CUBE_STRIDE; i++) {
      this.accumulator[i] = (this.accumulator[i] ?? 0) / neighbors;
    }
  }

  private nextProbe(): number {
    if (this.dirtyHead < this.dirtyQueue.length) {
      const index = this.dirtyQueue[this.dirtyHead] ?? 0;
      this.dirtyHead += 1;
      this.queued[index] = 0;
      if (this.dirtyHead === this.dirtyQueue.length) {
        this.dirtyQueue.length = 0;
        this.dirtyHead = 0;
      }
      return index;
    }
    const index = this.cursor;
    this.cursor = (this.cursor + 1) % this.probeCount;
    return index;
  }

  private updateProbe(index: number): void {
    const { origin, spacing, counts, raysPerProbe, blend } = this.config;
    const layer = counts[0] * counts[1];
    const px = origin.x + (index % counts[0]) * spacing;
    const py = origin.y + (Math.floor(index / counts[0]) % counts[1]) * spacing;
    const pz = origin.z + Math.floor(index / layer) * spacing;
    const grid = this.grid;
    const inSolid = isVoxelOccupied(
      grid,
      Math.floor((px - grid.origin.x) / grid.voxelSize),
      Math.floor((py - grid.origin.y) / grid.voxelSize),
      Math.floor((pz - grid.origin.z) / grid.voxelSize),
    );
    if (inSolid) {
      this.valid[index] = 0;
      return;
    }
    this.valid[index] = 1;

    const age = this.age[index] ?? 0;
    const [u1, u2] = r2Sample(age);
    rotationFromSample(u1, u2, (age * GOLDEN_FRACTION) % 1, this.rotation);
    const r = this.rotation;
    this.accumulator.fill(0);
    for (let ray = 0; ray < raysPerProbe; ray++) {
      const bx = this.baseDirections[ray * 3] ?? 0;
      const by = this.baseDirections[ray * 3 + 1] ?? 0;
      const bz = this.baseDirections[ray * 3 + 2] ?? 0;
      const dx = r[0] * bx + r[1] * by + r[2] * bz;
      const dy = r[3] * bx + r[4] * by + r[5] * bz;
      const dz = r[6] * bx + r[7] * by + r[8] * bz;
      this.traceRadiance(px, py, pz, dx, dy, dz);
      const radiance = this.rayRadiance;
      accumulateAmbientCube(this.accumulator, dx, dy, dz, radiance[0], radiance[1], radiance[2]);
    }

    const scale = IRRADIANCE_ESTIMATOR_SCALE / raysPerProbe;
    const alpha = age === 0 ? 1 : blend;
    const base = index * CUBE_STRIDE;
    for (let i = 0; i < CUBE_STRIDE; i++) {
      const previous = this.cube[base + i] ?? 0;
      const next = previous + alpha * ((this.accumulator[i] ?? 0) * scale - previous);
      this.cube[base + i] = Number.isFinite(next) ? next : previous;
    }
    this.age[index] = age + 1;
  }

  private traceRadiance(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
  ): void {
    const maxDistance = this.config.maxRayDistance;
    const hit = traceVoxelRayInto(this.grid, ox, oy, oz, dx, dy, dz, maxDistance, this.rayHit);
    if (!hit) {
      skyRadianceInto(this.environment, dy, this.rayRadiance);
      return;
    }
    this.shadeHit(ox, oy, oz, dx, dy, dz);
  }

  private shadeHit(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number): void {
    const { grid, rayHit: hit, rayRadiance: out, environment } = this;
    const material =
      grid.materials[voxelMaterialId(grid, hit.cellX, hit.cellY, hit.cellZ)] ?? MISSING_MATERIAL;
    const px = ox + dx * hit.distance;
    const py = oy + dy * hit.distance;
    const pz = oz + dz * hit.distance;
    const nx = hit.normalX;
    const ny = hit.normalY;
    const nz = hit.normalZ;
    const sun = environment.sunDirection;
    const cosSun = nx * sun.x + ny * sun.y + nz * sun.z;
    let sunFactor = 0;
    if (cosSun > 0) {
      const contact = grid.voxelSize * CONTACT_BIAS_RATIO;
      const blocked = traceVoxelRayInto(
        grid,
        px + nx * contact,
        py + ny * contact,
        pz + nz * contact,
        sun.x,
        sun.y,
        sun.z,
        this.config.maxRayDistance,
        this.shadowHit,
      );
      if (!blocked) sunFactor = cosSun * INVERSE_PI;
    }
    const bias = this.config.normalBias;
    this.sampleInto(px + nx * bias, py + ny * bias, pz + nz * bias, nx, ny, nz, this.fieldSample);
    for (const c of CHANNELS) {
      const albedo = Math.min(clampFinite(material.albedo[c], 1), ALBEDO_LIMIT);
      const emissive = clampFinite(material.emissive[c], RADIANCE_LIMIT);
      const incoming = environment.sunIrradiance[c] * sunFactor + this.fieldSample[c];
      out[c] = clampFinite(emissive + albedo * incoming, RADIANCE_LIMIT);
    }
  }

  private sampleInto(
    px: number,
    py: number,
    pz: number,
    nx: number,
    ny: number,
    nz: number,
    out: MutableRgb,
  ): void {
    const { origin, spacing, counts } = this.config;
    const gx = (px - origin.x) / spacing;
    const gy = (py - origin.y) / spacing;
    const gz = (pz - origin.z) / spacing;
    const x0 = cellFloor(gx, counts[0]);
    const y0 = cellFloor(gy, counts[1]);
    const z0 = cellFloor(gz, counts[2]);
    const tx = cellFraction(gx, x0, counts[0]);
    const ty = cellFraction(gy, y0, counts[1]);
    const tz = cellFraction(gz, z0, counts[2]);
    const corner = this.cornerSample;
    let red = 0;
    let green = 0;
    let blue = 0;
    let weightSum = 0;
    for (let index8 = 0; index8 < 8; index8++) {
      const cx = index8 & 1;
      const cy = (index8 >> 1) & 1;
      const cz = (index8 >> 2) & 1;
      const ix = Math.min(x0 + cx, counts[0] - 1);
      const iy = Math.min(y0 + cy, counts[1] - 1);
      const iz = Math.min(z0 + cz, counts[2] - 1);
      const index = ix + counts[0] * (iy + counts[1] * iz);
      if (this.valid[index] !== 1) continue;
      let weight = (cx === 1 ? tx : 1 - tx) * (cy === 1 ? ty : 1 - ty) * (cz === 1 ? tz : 1 - tz);
      if (weight <= 0) continue;
      const vx = origin.x + ix * spacing - px;
      const vy = origin.y + iy * spacing - py;
      const vz = origin.z + iz * spacing - pz;
      const distance = Math.hypot(vx, vy, vz);
      if (distance > DISTANCE_EPSILON) {
        const facing = (HALF * (distance + vx * nx + vy * ny + vz * nz)) / distance;
        weight *= facing * facing + BACKFACE_FLOOR;
      }
      evaluateAmbientCube(this.cube, index * CUBE_STRIDE, nx, ny, nz, corner);
      red += weight * corner[0];
      green += weight * corner[1];
      blue += weight * corner[2];
      weightSum += weight;
    }
    if (weightSum < WEIGHT_EPSILON) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      return;
    }
    const inverse = 1 / weightSum;
    out[0] = red * inverse;
    out[1] = green * inverse;
    out[2] = blue * inverse;
  }
}
