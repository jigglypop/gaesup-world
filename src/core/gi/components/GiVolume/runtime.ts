import { ProbeVolume } from '../../core/probeVolume';
import { createVoxelGrid } from '../../core/voxelGrid';
import {
  alignedProbeLayout,
  computeBoxBounds,
  computeGridSpec,
  expandBounds,
  rebuildVoxelGrid,
} from '../../core/voxelScene';
import type { GiEnvironment, VoxelSourceBox } from '../../types';
import type { GiRuntime, GiRuntimeParams } from './types';

const BOUNDS_SNAP = 8;
const PROBE_HEIGHT_OFFSET = 0.5;
const NORMAL_BIAS_VOXELS = 1.5;
const MAX_RAY_DISTANCE = 512;
const HALF = 0.5;

/**
 * 박스 목록으로 GI 런타임을 만든다. 그리드 명세와 프로브 배치가 이전과 같으면 그리드만 다시 채우고
 * 프로브 값은 유지해 편집 중에 조명이 깜박이지 않게 한다. 박스가 없으면 null을 반환한다.
 */
export function createGiRuntime(
  previous: GiRuntime | null,
  boxes: readonly VoxelSourceBox[],
  params: GiRuntimeParams,
  environment: GiEnvironment,
): GiRuntime | null {
  const bounds = computeBoxBounds(boxes);
  if (!bounds) return null;
  const { voxelSize, probeSpacing, raysPerProbe, padding, blend } = params;
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
  ].join('|');
  if (previous?.signature === signature) {
    rebuildVoxelGrid(previous.grid, boxes);
    previous.volume.markAllDirty();
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
  const volume = new ProbeVolume(
    grid,
    {
      ...layout,
      spacing: probeSpacing,
      raysPerProbe,
      blend,
      normalBias: voxelSize * NORMAL_BIAS_VOXELS,
      maxRayDistance: MAX_RAY_DISTANCE,
    },
    environment,
  );
  return { signature, grid, volume, exportBuffer: volume.exportFaceData(), uploadedVersion: -1 };
}
