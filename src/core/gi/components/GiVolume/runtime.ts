import type { GiRuntime, GiRuntimeParams } from './types';
import { instantiateGiWasm } from '../../core/giWasm';
import { ProbeCascade } from '../../core/probeCascade';
import { createVoxelGrid } from '../../core/voxelGrid';
import {
  alignedProbeLayout,
  computeBoxBounds,
  computeGridSpec,
  expandBounds,
  rebuildVoxelGrid,
} from '../../core/voxelScene';
import type { Aabb, GiEnvironment, ProbeVolumeConfig, VoxelSourceBox } from '../../types';

const BOUNDS_SNAP = 8;
const PROBE_HEIGHT_OFFSET = 0.5;
const NORMAL_BIAS_VOXELS = 1.5;
const MAX_RAY_DISTANCE = 512;
const MAX_FINE_PROBES = 16384;
const HALF = 0.5;

export function boundsKey(bounds: Aabb | null): string {
  if (!bounds) return 'none';
  const { min, max } = bounds;
  return [min.x, min.y, min.z, max.x, max.y, max.z].join(',');
}

function createFineConfig(
  bounds: Aabb | null,
  coarse: ProbeVolumeConfig,
): ProbeVolumeConfig | null {
  if (!bounds) return null;
  const spacing = coarse.spacing * HALF;
  const layout = alignedProbeLayout(bounds, spacing, {
    x: spacing * HALF,
    y: PROBE_HEIGHT_OFFSET,
    z: spacing * HALF,
  });
  if (layout.counts[0] * layout.counts[1] * layout.counts[2] > MAX_FINE_PROBES) return null;
  return { ...coarse, ...layout, spacing };
}

/**
 * 박스 목록으로 GI 런타임을 만든다. 그리드 명세와 프로브 배치가 이전과 같으면 그리드만 다시 채우고
 * 프로브 값은 유지해 편집 중에 조명이 깜박이지 않게 한다. 박스가 없으면 null을 반환한다.
 * fineBounds를 주면 그 영역에 성긴 간격의 절반인 촘촘한 프로브 레벨을 더한다(프로브가 너무 많으면 생략).
 */
export function createGiRuntime(
  previous: GiRuntime | null,
  boxes: readonly VoxelSourceBox[],
  params: GiRuntimeParams,
  environment: GiEnvironment,
): GiRuntime | null {
  const bounds = computeBoxBounds(boxes);
  if (!bounds) return null;
  const { voxelSize, probeSpacing, raysPerProbe, padding, blend, fineBounds } = params;
  const spec = computeGridSpec(expandBounds(bounds, BOUNDS_SNAP), voxelSize, padding);
  const signature = [
    spec.origin.x,
    spec.origin.y,
    spec.origin.z,
    ...spec.dims,
    voxelSize,
    probeSpacing,
    raysPerProbe,
    blend,
    boundsKey(fineBounds),
  ].join('|');
  if (previous?.signature === signature) {
    rebuildVoxelGrid(previous.grid, boxes);
    previous.cascade.markAllDirty();
    return previous;
  }

  const grid = createVoxelGrid(spec.origin, voxelSize, spec.dims);
  rebuildVoxelGrid(grid, boxes);
  const layout = alignedProbeLayout(
    {
      min: spec.origin,
      max: {
        x: spec.origin.x + spec.dims[0] * voxelSize,
        y: spec.origin.y + spec.dims[1] * voxelSize,
        z: spec.origin.z + spec.dims[2] * voxelSize,
      },
    },
    probeSpacing,
    { x: probeSpacing * HALF, y: PROBE_HEIGHT_OFFSET, z: probeSpacing * HALF },
  );
  const coarse: ProbeVolumeConfig = {
    ...layout,
    spacing: probeSpacing,
    raysPerProbe,
    blend,
    normalBias: voxelSize * NORMAL_BIAS_VOXELS,
    maxRayDistance: MAX_RAY_DISTANCE,
  };
  const cascade = new ProbeCascade(grid, coarse, createFineConfig(fineBounds, coarse), environment);
  return {
    signature,
    grid,
    cascade,
    exportBuffers: cascade.levels.map((level) => level.exportFaceData()),
    uploadedVersion: -1,
  };
}

/**
 * 컴파일된 GI 커널 모듈로 런타임 캐스케이드에 WASM 인스턴스를 붙인다. 이미 붙어 있거나 인스턴스를 만들 수 없으면
 * 아무것도 하지 않으며 캐스케이드는 JS 경로로 계속 갱신된다.
 */
export async function attachGiWasm(
  runtime: GiRuntime,
  module: WebAssembly.Module,
): Promise<boolean> {
  if (runtime.cascade.usesWasm) return true;
  const wasm = await instantiateGiWasm(module);
  if (!wasm || runtime.cascade.usesWasm) return runtime.cascade.usesWasm;
  runtime.cascade.attachWasm(wasm);
  return true;
}
