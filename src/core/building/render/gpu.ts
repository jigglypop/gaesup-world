import type { BuildingRenderSnapshot } from './core';

export const GPU_SPATIAL_STRIDE = 4; // xyz + radius
export const GPU_META_STRIDE = 4; // cellX, cellZ, kind, memberCount

export type DirtyRange = {
  start: number;
  end: number;
};

export type BuildingGpuBufferMirror = {
  version: number;
  count: number;
  spatial: Float32Array;
  meta: Int32Array;
  spatialDirty: DirtyRange[];
  metaDirty: DirtyRange[];
};

export type GpuUploadSlice = {
  byteOffset: number;
  elementOffset: number;
  elementCount: number;
  data: Float32Array | Int32Array;
};

export type BuildingGpuUploadPlan = {
  version: number;
  count: number;
  spatial: GpuUploadSlice[];
  meta: GpuUploadSlice[];
};

export function createEmptyGpuMirror(): BuildingGpuBufferMirror {
  return {
    version: 0,
    count: 0,
    spatial: new Float32Array(0),
    meta: new Int32Array(0),
    spatialDirty: [],
    metaDirty: [],
  };
}

function packSpatial(snapshot: BuildingRenderSnapshot): Float32Array {
  const packed = new Float32Array(snapshot.ids.length * GPU_SPATIAL_STRIDE);
  for (let i = 0; i < snapshot.ids.length; i += 1) {
    const base = i * GPU_SPATIAL_STRIDE;
    packed[base] = snapshot.centerX[i] ?? 0;
    packed[base + 1] = snapshot.centerY[i] ?? 0;
    packed[base + 2] = snapshot.centerZ[i] ?? 0;
    packed[base + 3] = snapshot.radius[i] ?? 0;
  }
  return packed;
}

function packMeta(snapshot: BuildingRenderSnapshot): Int32Array {
  const packed = new Int32Array(snapshot.ids.length * GPU_META_STRIDE);
  for (let i = 0; i < snapshot.ids.length; i += 1) {
    const base = i * GPU_META_STRIDE;
    packed[base] = snapshot.cellX[i] ?? 0;
    packed[base + 1] = snapshot.cellZ[i] ?? 0;
    packed[base + 2] = snapshot.kinds[i] ?? 0;
    packed[base + 3] = snapshot.memberCount[i] ?? 0;
  }
  return packed;
}

function collectDirtyRanges(previous: ArrayLike<number>, next: ArrayLike<number>, stride: number): DirtyRange[] {
  if (previous.length !== next.length) {
    return next.length > 0 ? [{ start: 0, end: Math.ceil(next.length / stride) }] : [];
  }

  const ranges: DirtyRange[] = [];
  let rangeStart = -1;
  const count = Math.ceil(next.length / stride);
  for (let i = 0; i < count; i += 1) {
    const base = i * stride;
    let changed = false;
    for (let s = 0; s < stride; s += 1) {
      if ((previous[base + s] ?? 0) !== (next[base + s] ?? 0)) {
        changed = true;
        break;
      }
    }
    if (changed) {
      if (rangeStart < 0) rangeStart = i;
      continue;
    }
    if (rangeStart >= 0) {
      ranges.push({ start: rangeStart, end: i });
      rangeStart = -1;
    }
  }

  if (rangeStart >= 0) {
    ranges.push({ start: rangeStart, end: count });
  }
  return ranges;
}

export function buildBuildingGpuMirror(
  snapshot: BuildingRenderSnapshot,
  previous: BuildingGpuBufferMirror | null,
): BuildingGpuBufferMirror {
  const spatial = packSpatial(snapshot);
  const meta = packMeta(snapshot);
  const prev = previous ?? createEmptyGpuMirror();

  return {
    version: snapshot.version,
    count: snapshot.ids.length,
    spatial,
    meta,
    spatialDirty: collectDirtyRanges(prev.spatial, spatial, GPU_SPATIAL_STRIDE),
    metaDirty: collectDirtyRanges(prev.meta, meta, GPU_META_STRIDE),
  };
}

function createUploadSlices<T extends Float32Array | Int32Array>(
  source: T,
  stride: number,
  ranges: DirtyRange[],
): GpuUploadSlice[] {
  return ranges.map((range) => {
    const elementOffset = range.start * stride;
    const elementCount = (range.end - range.start) * stride;
    return {
      byteOffset: elementOffset * source.BYTES_PER_ELEMENT,
      elementOffset,
      elementCount,
      data: source.subarray(elementOffset, elementOffset + elementCount) as T,
    };
  });
}

export function createBuildingGpuUploadPlan(mirror: BuildingGpuBufferMirror): BuildingGpuUploadPlan {
  return {
    version: mirror.version,
    count: mirror.count,
    spatial: createUploadSlices(mirror.spatial, GPU_SPATIAL_STRIDE, mirror.spatialDirty),
    meta: createUploadSlices(mirror.meta, GPU_META_STRIDE, mirror.metaDirty),
  };
}
