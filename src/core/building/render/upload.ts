import { createBuildingIndirectDrawUploadPlan, type BuildingIndirectDrawMirror } from './draw';
import { createBuildingGpuUploadPlan, type BuildingGpuBufferMirror } from './gpu';

const GPU_BUFFER_USAGE_COPY_DST = 0x0008;
const GPU_BUFFER_USAGE_STORAGE = 0x0080;

export type GpuQueueLike = {
  writeBuffer: (buffer: GpuBufferLike, bufferOffset: number, data: BufferSource) => void;
};

export type GpuBufferLike = {
  destroy?: () => void;
};

export type GpuDeviceLike = {
  createBuffer: (descriptor: { label?: string; size: number; usage: number }) => GpuBufferLike;
  queue: GpuQueueLike;
};

type RendererLike = {
  backend?: {
    device?: GpuDeviceLike | null;
  };
  device?: GpuDeviceLike | null;
};

export type BuildingGpuUploadResources = {
  backend: 'none' | 'webgpu';
  uploadedVersion: number;
  spatialBuffer: GpuBufferLike | null;
  metaBuffer: GpuBufferLike | null;
  indirectArgsBuffer: GpuBufferLike | null;
  spatialBytes: number;
  metaBytes: number;
  indirectArgsBytes: number;
};

export function createEmptyBuildingGpuUploadResources(): BuildingGpuUploadResources {
  return {
    backend: 'none',
    uploadedVersion: 0,
    spatialBuffer: null,
    metaBuffer: null,
    indirectArgsBuffer: null,
    spatialBytes: 0,
    metaBytes: 0,
    indirectArgsBytes: 0,
  };
}

export function getWebGPUDeviceFromRenderer(renderer: object | null | undefined): GpuDeviceLike | null {
  if (typeof renderer !== 'object' || renderer === null) return null;

  const rendererLike = renderer as RendererLike;
  const candidate = rendererLike.backend?.device ?? rendererLike.device ?? null;

  if (!candidate) return null;
  if (typeof candidate.createBuffer !== 'function') return null;
  if (typeof candidate.queue?.writeBuffer !== 'function') return null;
  return candidate;
}

function destroyBuffer(buffer: GpuBufferLike | null): void {
  if (!buffer?.destroy) return;
  buffer.destroy();
}

export function destroyBuildingGpuUploadResources(resources: BuildingGpuUploadResources): void {
  destroyBuffer(resources.spatialBuffer);
  destroyBuffer(resources.metaBuffer);
  destroyBuffer(resources.indirectArgsBuffer);
}

function ensureBuffer(
  device: GpuDeviceLike,
  existing: GpuBufferLike | null,
  existingBytes: number,
  nextBytes: number,
  label: string,
): GpuBufferLike | null {
  if (nextBytes <= 0) {
    destroyBuffer(existing);
    return null;
  }
  if (existing && existingBytes === nextBytes) {
    return existing;
  }
  destroyBuffer(existing);
  return device.createBuffer({
    label,
    size: nextBytes,
    usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
  });
}

export function syncBuildingGpuBuffers(
  device: GpuDeviceLike,
  previous: BuildingGpuUploadResources,
  mirror: BuildingGpuBufferMirror,
): BuildingGpuUploadResources {
  const plan = createBuildingGpuUploadPlan(mirror);
  const spatialBytes = mirror.spatial.byteLength;
  const metaBytes = mirror.meta.byteLength;

  const spatialBuffer = ensureBuffer(
    device,
    previous.spatialBuffer,
    previous.spatialBytes,
    spatialBytes,
    'building-spatial',
  );
  const metaBuffer = ensureBuffer(
    device,
    previous.metaBuffer,
    previous.metaBytes,
    metaBytes,
    'building-meta',
  );

  if (spatialBuffer) {
    for (const slice of plan.spatial) {
      device.queue.writeBuffer(spatialBuffer, slice.byteOffset, slice.data);
    }
  }
  if (metaBuffer) {
    for (const slice of plan.meta) {
      device.queue.writeBuffer(metaBuffer, slice.byteOffset, slice.data);
    }
  }

  return {
    backend: 'webgpu',
    uploadedVersion: mirror.version,
    spatialBuffer,
    metaBuffer,
    indirectArgsBuffer: previous.indirectArgsBuffer,
    spatialBytes,
    metaBytes,
    indirectArgsBytes: previous.indirectArgsBytes,
  };
}

export function syncBuildingIndirectArgsBuffer(
  device: GpuDeviceLike,
  previous: BuildingGpuUploadResources,
  mirror: BuildingIndirectDrawMirror,
): BuildingGpuUploadResources {
  const plan = createBuildingIndirectDrawUploadPlan(mirror);
  const indirectArgsBytes = mirror.args.byteLength;
  const indirectArgsBuffer = ensureBuffer(
    device,
    previous.indirectArgsBuffer,
    previous.indirectArgsBytes,
    indirectArgsBytes,
    'building-indirect-args',
  );

  if (indirectArgsBuffer) {
    for (const slice of plan.slices) {
      device.queue.writeBuffer(indirectArgsBuffer, slice.byteOffset, slice.data);
    }
  }

  return {
    ...previous,
    backend: 'webgpu',
    uploadedVersion: Math.max(previous.uploadedVersion, mirror.version),
    indirectArgsBuffer,
    indirectArgsBytes,
  };
}
