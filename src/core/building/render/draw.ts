import {
  DRAW_CLUSTER_BILLBOARD,
  DRAW_CLUSTER_BLOCK,
  DRAW_CLUSTER_COUNT,
  DRAW_CLUSTER_FIRE,
  DRAW_CLUSTER_FLAG,
  DRAW_CLUSTER_GRASS,
  DRAW_CLUSTER_SAKURA,
  DRAW_CLUSTER_SAND,
  DRAW_CLUSTER_SNOWFIELD,
  DRAW_CLUSTER_TILE,
  DRAW_CLUSTER_WALL,
  DRAW_CLUSTER_WATER,
} from './culling';

export {
  DRAW_CLUSTER_BILLBOARD,
  DRAW_CLUSTER_BLOCK,
  DRAW_CLUSTER_COUNT,
  DRAW_CLUSTER_FIRE,
  DRAW_CLUSTER_FLAG,
  DRAW_CLUSTER_GRASS,
  DRAW_CLUSTER_SAKURA,
  DRAW_CLUSTER_SAND,
  DRAW_CLUSTER_SNOWFIELD,
  DRAW_CLUSTER_TILE,
  DRAW_CLUSTER_WALL,
  DRAW_CLUSTER_WATER,
} from './culling';

export const INDIRECT_DRAW_STRIDE = 4; // vertexCount, instanceCount, firstVertex, firstInstance

export type BuildingIndirectDrawMirror = {
  version: number;
  args: Uint32Array;
  dirtyRanges: Array<{ start: number; end: number }>;
};

export type BuildingIndirectDrawUploadPlan = {
  version: number;
  slices: Array<{
    byteOffset: number;
    elementOffset: number;
    elementCount: number;
    data: Uint32Array;
  }>;
};

export function getIndirectInstanceCount(mirror: BuildingIndirectDrawMirror, clusterId: number): number {
  const base = clusterId * INDIRECT_DRAW_STRIDE;
  return mirror.args[base + 1] ?? 0;
}

export type DrawClusterDescriptor = {
  id: number;
  label: string;
  vertexCountHint: number;
};

export const DRAW_CLUSTER_DESCRIPTORS: DrawClusterDescriptor[] = [
  { id: DRAW_CLUSTER_TILE, label: 'tile', vertexCountHint: 36 },
  { id: DRAW_CLUSTER_GRASS, label: 'grass', vertexCountHint: 36 },
  { id: DRAW_CLUSTER_WATER, label: 'water', vertexCountHint: 36 },
  { id: DRAW_CLUSTER_SAND, label: 'sand', vertexCountHint: 36 },
  { id: DRAW_CLUSTER_SNOWFIELD, label: 'snowfield', vertexCountHint: 36 },
  { id: DRAW_CLUSTER_WALL, label: 'wall', vertexCountHint: 36 },
  { id: DRAW_CLUSTER_SAKURA, label: 'sakura', vertexCountHint: 12 },
  { id: DRAW_CLUSTER_FLAG, label: 'flag', vertexCountHint: 12 },
  { id: DRAW_CLUSTER_FIRE, label: 'fire', vertexCountHint: 6 },
  { id: DRAW_CLUSTER_BILLBOARD, label: 'billboard', vertexCountHint: 6 },
  { id: DRAW_CLUSTER_BLOCK, label: 'block', vertexCountHint: 36 },
];

export function createEmptyBuildingIndirectDrawMirror(): BuildingIndirectDrawMirror {
  return {
    version: 0,
    args: new Uint32Array(DRAW_CLUSTER_COUNT * INDIRECT_DRAW_STRIDE),
    dirtyRanges: [],
  };
}

function collectDirtyRanges(previous: Uint32Array, next: Uint32Array): Array<{ start: number; end: number }> {
  if (previous.length !== next.length) {
    return next.length > 0 ? [{ start: 0, end: next.length / INDIRECT_DRAW_STRIDE }] : [];
  }

  const ranges: Array<{ start: number; end: number }> = [];
  let rangeStart = -1;
  const count = next.length / INDIRECT_DRAW_STRIDE;
  for (let i = 0; i < count; i += 1) {
    const base = i * INDIRECT_DRAW_STRIDE;
    let changed = false;
    for (let j = 0; j < INDIRECT_DRAW_STRIDE; j += 1) {
      if ((previous[base + j] ?? 0) !== (next[base + j] ?? 0)) {
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
  if (rangeStart >= 0) ranges.push({ start: rangeStart, end: count });
  return ranges;
}

export function buildBuildingIndirectDrawMirror(
  version: number,
  clusterCounts: Uint32Array,
  previous: BuildingIndirectDrawMirror | null,
): BuildingIndirectDrawMirror {
  const args = new Uint32Array(DRAW_CLUSTER_COUNT * INDIRECT_DRAW_STRIDE);
  for (const descriptor of DRAW_CLUSTER_DESCRIPTORS) {
    const base = descriptor.id * INDIRECT_DRAW_STRIDE;
    args[base] = descriptor.vertexCountHint;
    args[base + 1] = clusterCounts[descriptor.id] ?? 0;
    args[base + 2] = 0;
    args[base + 3] = 0;
  }

  const prev = previous ?? createEmptyBuildingIndirectDrawMirror();
  return {
    version,
    args,
    dirtyRanges: collectDirtyRanges(prev.args, args),
  };
}

export function createBuildingIndirectDrawUploadPlan(
  mirror: BuildingIndirectDrawMirror,
): BuildingIndirectDrawUploadPlan {
  return {
    version: mirror.version,
    slices: mirror.dirtyRanges.map((range) => {
      const elementOffset = range.start * INDIRECT_DRAW_STRIDE;
      const elementCount = (range.end - range.start) * INDIRECT_DRAW_STRIDE;
      return {
        byteOffset: elementOffset * mirror.args.BYTES_PER_ELEMENT,
        elementOffset,
        elementCount,
        data: mirror.args.subarray(elementOffset, elementOffset + elementCount),
      };
    }),
  };
}
