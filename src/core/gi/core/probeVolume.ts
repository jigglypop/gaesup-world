import type { Vec3 } from '../../grid';
import type {
  Aabb,
  FieldSampler,
  GiEnvironment,
  Mat3,
  MutableRgb,
  ProbeFaceBuffers,
  ProbeKernel,
  ProbeStorage,
  ProbeVolumeConfig,
  Rgb,
  VoxelGrid,
  VoxelMaterial,
} from '../types';
import { CUBE_CHANNELS, CUBE_FACE_COUNT, CUBE_STRIDE, accumulateAmbientCube } from './cube';
import {
  ALBEDO_LIMIT,
  RADIANCE_LIMIT,
  clampFinite,
  normalizeEnvironment,
  skyRadianceInto,
} from './giEnvironment';
import { packProbeAtlas } from './probeAtlas';
import {
  BACKFACE_FLOOR,
  FEED_BACKFACE_FLOOR,
  sampleProbeField,
  type ProbeFieldSource,
} from './probeField';
import { probeRange, validateConfig } from './probeGrid';
import { fibonacciSphereDirection, r2Sample, rotationFromSample } from './sampling';
import { createVoxelHitScratch, traceVoxelRayInto } from './traceVoxels';
import { isVoxelOccupied, voxelMaterialId } from './voxelGrid';

type Channel = 0 | 1 | 2;

const CHANNELS: readonly Channel[] = [0, 1, 2];
const TEXEL_STRIDE = 4;
const IRRADIANCE_ESTIMATOR_SCALE = 4;
const INVERSE_PI = 1 / Math.PI;
const GOLDEN_FRACTION = 0.6180339887498949;
const CONTACT_BIAS_RATIO = 1e-3;
const DIRTY_MARGIN_SPACINGS = 2;
const CHANGE_LOW = 0.25;
const CHANGE_HIGH = 0.7;
const CHANGE_EPSILON = 1e-6;
const RELOCATION_REACH = 0.35;
const RELOCATION_STEPS = 3;
const AXIS_SIGNS = [1, -1] as const;
const MISSING_MATERIAL: VoxelMaterial = { albedo: [0, 0, 0], emissive: [0, 0, 0] };

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
  private cube: Float32Array;
  private valid: Uint8Array;
  private offsets: Float32Array;
  private field: ProbeFieldSource;
  private age: Uint32Array;
  private readonly pending: Uint32Array;
  private kernel: ProbeKernel | null = null;
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
  private feed: FieldSampler | null = null;
  private cursor = 0;

  constructor(grid: VoxelGrid, config: ProbeVolumeConfig, environment: GiEnvironment) {
    validateConfig(config);
    this.grid = grid;
    this.config = { ...config, origin: { ...config.origin } };
    this.environment = normalizeEnvironment(environment);
    this.probeCount = config.counts[0] * config.counts[1] * config.counts[2];
    this.cube = new Float32Array(this.probeCount * CUBE_STRIDE);
    this.valid = new Uint8Array(this.probeCount);
    this.offsets = new Float32Array(this.probeCount * 3);
    this.field = { config: this.config, cube: this.cube, valid: this.valid };
    this.age = new Uint32Array(this.probeCount);
    this.pending = new Uint32Array(this.probeCount);
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

  /**
   * 히트 지점의 간접광을 이 볼륨 대신 다른 샘플러에서 읽게 한다. 캐스케이드가 여러 볼륨을 합쳐 되먹일 때 쓴다.
   */
  setFeed(feed: FieldSampler | null): void {
    this.feed = feed;
  }

  /**
   * 프로브 저장소를 외부 버퍼(WASM 메모리 뷰 등)로 옮긴다. 현재 값을 복사한 뒤 이후 갱신과 조회는 새 버퍼를 쓴다.
   */
  bindStorage(storage: ProbeStorage): void {
    if (
      storage.cube.length !== this.cube.length ||
      storage.valid.length !== this.valid.length ||
      storage.offsets.length !== this.offsets.length ||
      storage.age.length !== this.age.length
    ) {
      throw new RangeError('[ProbeVolume Error]: storage size does not match the probe count');
    }
    storage.cube.set(this.cube);
    storage.valid.set(this.valid);
    storage.offsets.set(this.offsets);
    storage.age.set(this.age);
    this.cube = storage.cube;
    this.valid = storage.valid;
    this.offsets = storage.offsets;
    this.age = storage.age;
    this.field = { config: this.config, cube: this.cube, valid: this.valid };
  }

  /**
   * 한 번의 update에서 고른 프로브 목록을 JS 대신 처리할 커널을 지정한다. null이면 JS로 갱신한다.
   */
  setKernel(kernel: ProbeKernel | null): void {
    this.kernel = kernel;
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
    for (let iz: number = rangeZ[0]; iz <= rangeZ[1]; iz++) {
      for (let iy: number = rangeY[0]; iy <= rangeY[1]; iy++) {
        for (let ix: number = rangeX[0]; ix <= rangeX[1]; ix++) {
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
      this.pending[processed] = this.nextProbe();
    }
    if (this.kernel) {
      this.kernel(this.pending, budget);
    } else {
      for (let processed = 0; processed < budget; processed++) {
        this.updateProbe(this.pending[processed] ?? 0);
      }
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
   * 할당 없이 이 볼륨만으로 조도/PI를 구해 out에 쓴다. 캐스케이드가 레벨별 값을 섞을 때 쓴다.
   */
  sampleInto(
    px: number,
    py: number,
    pz: number,
    nx: number,
    ny: number,
    nz: number,
    out: MutableRgb,
    backfaceFloor: number = BACKFACE_FLOOR,
  ): void {
    sampleProbeField(this.field, px, py, pz, nx, ny, nz, out, backfaceFloor, this.cornerSample);
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
      const cube = this.probeCube(index);
      for (let face = 0; face < CUBE_FACE_COUNT; face++) {
        const buffer = faces[face];
        if (!buffer) continue;
        const texel = index * TEXEL_STRIDE;
        for (const c of CHANNELS) {
          buffer[texel + c] = cube[face * CUBE_CHANNELS + c] ?? 0;
        }
        buffer[texel + CUBE_CHANNELS] = 1;
      }
    }
    return faces;
  }

  /** exportFaceData와 같은 값을 반정밀도 아틀라스(probeAtlas.ts)에 면별 float 버퍼 없이 바로 쓴다. */
  packAtlas(target: Uint16Array): void {
    packProbeAtlas(target, this.config.counts, (index) => this.probeCube(index));
  }

  /** 프로브의 조도 큐브(복셀 안에 묻힌 프로브는 이웃 평균). 다음 호출이 덮어쓰는 내부 버퍼다. */
  private probeCube(index: number): Float64Array {
    if (this.valid[index] === 1) this.loadProbe(index);
    else this.loadDilated(index);
    return this.accumulator;
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

  private isSolidAt(x: number, y: number, z: number): boolean {
    const grid = this.grid;
    return isVoxelOccupied(
      grid,
      Math.floor((x - grid.origin.x) / grid.voxelSize),
      Math.floor((y - grid.origin.y) / grid.voxelSize),
      Math.floor((z - grid.origin.z) / grid.voxelSize),
    );
  }

  /**
   * 격자점이 복셀 안(표면 경계 포함)이면 축 방향으로 가장 가까운 빈 곳으로 추적 원점을 옮긴다.
   * 같은 축의 양쪽이 같은 거리에서 동시에 비면 얇은 벽 한가운데라 어느 쪽을 대표할지 모호하므로 무효로 둔다.
   * 조회는 계속 격자 위치로 하므로 셰이더의 하드웨어 보간과 어긋나지 않는다.
   */
  private placeProbe(index: number, px: number, py: number, pz: number): boolean {
    const base = index * 3;
    this.offsets[base] = 0;
    this.offsets[base + 1] = 0;
    this.offsets[base + 2] = 0;
    if (!this.isSolidAt(px, py, pz)) return true;
    const reach = this.config.spacing * RELOCATION_REACH;
    for (let step = 1; step <= RELOCATION_STEPS; step++) {
      const distance = (reach * step) / RELOCATION_STEPS;
      let escapeAxis = -1;
      let escapeSign = 0;
      for (let axis = 0; axis < 3; axis++) {
        let openSides = 0;
        for (const sign of AXIS_SIGNS) {
          const shift = sign * distance;
          const open = !this.isSolidAt(
            px + (axis === 0 ? shift : 0),
            py + (axis === 1 ? shift : 0),
            pz + (axis === 2 ? shift : 0),
          );
          if (!open) continue;
          openSides += 1;
          if (escapeAxis < 0) {
            escapeAxis = axis;
            escapeSign = sign;
          }
        }
        if (openSides > 1) return false;
      }
      if (escapeAxis >= 0) {
        this.offsets[base + escapeAxis] = escapeSign * distance;
        return true;
      }
    }
    return false;
  }

  /**
   * 새 추정값의 전체 조도(18개 성분 합)가 저장값과 크게 다르면 blend를 1 쪽으로 올려 조명 변화와
   * 다중 바운스 전파를 빠르게 따라가고, 차이가 잡음 수준이면 blend를 유지해 떨림을 억제한다.
   * 변화량은 |새 값 - 이전 값| / (새 값 + 이전 값)으로 0에서 1 사이이며 절대 밝기와 무관하다.
   */
  private adaptiveBlend(base: number, scale: number, blend: number): number {
    let previous = 0;
    let next = 0;
    for (let i = 0; i < CUBE_STRIDE; i++) {
      previous += this.cube[base + i] ?? 0;
      next += (this.accumulator[i] ?? 0) * scale;
    }
    const change = Math.abs(next - previous) / Math.max(next + previous, CHANGE_EPSILON);
    const t = Math.min(1, Math.max(0, (change - CHANGE_LOW) / (CHANGE_HIGH - CHANGE_LOW)));
    return blend + (1 - blend) * t * t * (3 - 2 * t);
  }

  private updateProbe(index: number): void {
    const { origin, spacing, counts, raysPerProbe, blend } = this.config;
    const layer = counts[0] * counts[1];
    const age = this.age[index] ?? 0;
    const base3 = index * 3;
    if (age === 0) {
      const gx = origin.x + (index % counts[0]) * spacing;
      const gy = origin.y + (Math.floor(index / counts[0]) % counts[1]) * spacing;
      const gz = origin.z + Math.floor(index / layer) * spacing;
      const placed = this.placeProbe(index, gx, gy, gz);
      this.valid[index] = placed ? 1 : 0;
      if (!placed) return;
    }
    const px = origin.x + (index % counts[0]) * spacing + (this.offsets[base3] ?? 0);
    const py =
      origin.y +
      (Math.floor(index / counts[0]) % counts[1]) * spacing +
      (this.offsets[base3 + 1] ?? 0);
    const pz = origin.z + Math.floor(index / layer) * spacing + (this.offsets[base3 + 2] ?? 0);
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
    const base = index * CUBE_STRIDE;
    const alpha = age === 0 ? 1 : this.adaptiveBlend(base, scale, blend);
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
    const fed = this.fieldSample;
    const lx = px + nx * bias;
    const ly = py + ny * bias;
    const lz = pz + nz * bias;
    if (this.feed) this.feed(lx, ly, lz, nx, ny, nz, fed);
    else this.sampleInto(lx, ly, lz, nx, ny, nz, fed, FEED_BACKFACE_FLOOR);
    for (const c of CHANNELS) {
      const albedo = Math.min(clampFinite(material.albedo[c], 1), ALBEDO_LIMIT);
      const emissive = clampFinite(material.emissive[c], RADIANCE_LIMIT);
      const incoming = environment.sunIrradiance[c] * sunFactor + fed[c];
      out[c] = clampFinite(emissive + albedo * incoming, RADIANCE_LIMIT);
    }
  }
}
