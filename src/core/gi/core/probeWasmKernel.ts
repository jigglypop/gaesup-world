import type { GiEnvironment, GiWasmExports, ProbeStorage, VoxelGrid } from '../types';
import { CUBE_STRIDE } from './cube';
import { ALBEDO_LIMIT, RADIANCE_LIMIT, clampFinite, normalizeEnvironment } from './giEnvironment';
import type { ProbeVolume } from './probeVolume';
import { fibonacciSphereDirection } from './sampling';
import { MAX_MATERIAL_ID } from './voxelGrid';

const HEADER_GRID_ORIGIN = 0;
const HEADER_VOXEL_SIZE = 3;
const HEADER_DIMS = 4;
const HEADER_MATERIAL_COUNT = 7;
const HEADER_ENVIRONMENT = 8;
const HEADER_LEVEL_COUNT = 23;
const HEADER_LEVELS = 24;
const LEVEL_STRIDE = 12;
const MAX_LEVELS = 2;
const HEADER_LENGTH = HEADER_LEVELS + LEVEL_STRIDE * MAX_LEVELS;
const POINTER_LEVELS = 2;
const POINTERS_PER_LEVEL = 5;
const MATERIAL_STRIDE = 6;
const MATERIAL_CAPACITY = MAX_MATERIAL_ID + 1;
const OFFSET_STRIDE = 3;
const DIRECTION_STRIDE = 3;

type LevelBuffers = {
  cube: number;
  valid: number;
  offsets: number;
  age: number;
  directions: number;
  probeCount: number;
  rays: number;
};

/**
 * 캐스케이드 한 개를 위한 WASM 프로브 갱신 커널. 모든 버퍼를 생성자에서 한 번에 할당하므로
 * 이후 WASM 메모리가 늘지 않아 여기서 만든 뷰가 무효화되지 않는다. 헤더와 포인터 배치는 wasm/src/lib.rs와 같다.
 */
export class ProbeWasmKernel {
  private readonly wasm: GiWasmExports;
  private readonly grid: VoxelGrid;
  private readonly headerPtr: number;
  private readonly pointersPtr: number;
  private readonly indicesPtr: number;
  private readonly header: Float64Array;
  private readonly occupancy: Uint8Array;
  private readonly materials: Float64Array;
  private readonly indices: Uint32Array;
  private readonly storages: ProbeStorage[];

  constructor(
    wasm: GiWasmExports,
    grid: VoxelGrid,
    levels: readonly ProbeVolume[],
    environment: GiEnvironment,
  ) {
    if (levels.length < 1 || levels.length > MAX_LEVELS) {
      throw new RangeError('[ProbeWasmKernel Error]: a cascade must have one or two levels');
    }
    this.wasm = wasm;
    this.grid = grid;
    this.headerPtr = wasm.alloc_f64(HEADER_LENGTH);
    this.pointersPtr = wasm.alloc_u32(POINTER_LEVELS + POINTERS_PER_LEVEL * levels.length);
    const occupancyPtr = wasm.alloc_u8(grid.occupancy.length);
    const materialsPtr = wasm.alloc_f64(MATERIAL_CAPACITY * MATERIAL_STRIDE);
    const maxProbes = Math.max(...levels.map((level) => level.probeCount));
    this.indicesPtr = wasm.alloc_u32(maxProbes);
    const buffers: LevelBuffers[] = levels.map((level) => ({
      cube: wasm.alloc_f32(level.probeCount * CUBE_STRIDE),
      valid: wasm.alloc_u8(level.probeCount),
      offsets: wasm.alloc_f32(level.probeCount * OFFSET_STRIDE),
      age: wasm.alloc_u32(level.probeCount),
      directions: wasm.alloc_f64(level.config.raysPerProbe * DIRECTION_STRIDE),
      probeCount: level.probeCount,
      rays: level.config.raysPerProbe,
    }));

    const memory = wasm.memory.buffer;
    this.header = new Float64Array(memory, this.headerPtr, HEADER_LENGTH);
    this.occupancy = new Uint8Array(memory, occupancyPtr, grid.occupancy.length);
    this.materials = new Float64Array(memory, materialsPtr, MATERIAL_CAPACITY * MATERIAL_STRIDE);
    this.indices = new Uint32Array(memory, this.indicesPtr, maxProbes);
    this.storages = buffers.map((buffer) => ({
      cube: new Float32Array(memory, buffer.cube, buffer.probeCount * CUBE_STRIDE),
      valid: new Uint8Array(memory, buffer.valid, buffer.probeCount),
      offsets: new Float32Array(memory, buffer.offsets, buffer.probeCount * OFFSET_STRIDE),
      age: new Uint32Array(memory, buffer.age, buffer.probeCount),
    }));

    const pointers = new Uint32Array(
      memory,
      this.pointersPtr,
      POINTER_LEVELS + POINTERS_PER_LEVEL * levels.length,
    );
    pointers[0] = occupancyPtr;
    pointers[1] = materialsPtr;
    buffers.forEach((buffer, index) => {
      const slot = POINTER_LEVELS + index * POINTERS_PER_LEVEL;
      pointers.set(
        [buffer.cube, buffer.valid, buffer.offsets, buffer.age, buffer.directions],
        slot,
      );
      const directions = new Float64Array(
        memory,
        buffer.directions,
        buffer.rays * DIRECTION_STRIDE,
      );
      for (let ray = 0; ray < buffer.rays; ray++) {
        const direction = fibonacciSphereDirection(ray, buffer.rays);
        directions.set([direction.x, direction.y, direction.z], ray * DIRECTION_STRIDE);
      }
    });

    const header = this.header;
    header.set([grid.origin.x, grid.origin.y, grid.origin.z], HEADER_GRID_ORIGIN);
    header[HEADER_VOXEL_SIZE] = grid.voxelSize;
    header.set(grid.dims, HEADER_DIMS);
    header[HEADER_LEVEL_COUNT] = levels.length;
    levels.forEach((level, index) => {
      const { origin, spacing, counts, raysPerProbe, blend, normalBias, maxRayDistance } =
        level.config;
      header.set(
        [
          origin.x,
          origin.y,
          origin.z,
          spacing,
          ...counts,
          raysPerProbe,
          blend,
          normalBias,
          maxRayDistance,
        ],
        HEADER_LEVELS + index * LEVEL_STRIDE,
      );
    });
    this.syncGrid();
    this.syncEnvironment(environment);
  }

  storage(level: number): ProbeStorage {
    const storage = this.storages[level];
    if (!storage) throw new RangeError('[ProbeWasmKernel Error]: unknown level');
    return storage;
  }

  /**
   * 복셀 점유와 재질 팔레트를 WASM 메모리로 복사한다. 재질은 JS 경로와 같은 상한으로 미리 정리한다.
   */
  syncGrid(): void {
    this.occupancy.set(this.grid.occupancy);
    const count = Math.min(this.grid.materials.length, MATERIAL_CAPACITY);
    for (let id = 0; id < count; id++) {
      const material = this.grid.materials[id];
      if (!material) continue;
      const base = id * MATERIAL_STRIDE;
      for (let c = 0; c < 3; c++) {
        this.materials[base + c] = Math.min(clampFinite(material.albedo[c] ?? 0, 1), ALBEDO_LIMIT);
        this.materials[base + 3 + c] = clampFinite(material.emissive[c] ?? 0, RADIANCE_LIMIT);
      }
    }
    this.header[HEADER_MATERIAL_COUNT] = count;
  }

  syncEnvironment(environment: GiEnvironment): void {
    const { sunDirection, sunIrradiance, skyZenith, skyHorizon, skyGround } =
      normalizeEnvironment(environment);
    this.header.set(
      [
        sunDirection.x,
        sunDirection.y,
        sunDirection.z,
        ...sunIrradiance,
        ...skyZenith,
        ...skyHorizon,
        ...skyGround,
      ],
      HEADER_ENVIRONMENT,
    );
  }

  run(level: number, indices: Uint32Array, count: number): void {
    this.indices.set(indices.subarray(0, count));
    this.wasm.gi_update_probes(this.headerPtr, this.pointersPtr, level, this.indicesPtr, count);
  }
}
