import { createBuildingIndirectDrawUploadPlan, type BuildingIndirectDrawMirror } from './draw';
import { createBuildingGpuUploadPlan, type BuildingGpuBufferMirror } from './gpu';

const GPU_BUFFER_USAGE_COPY_DST = 0x0008;
const GPU_BUFFER_USAGE_STORAGE = 0x0080;
const GPU_BUFFER_USAGE_INDIRECT = 0x0100;

export type GpuQueueLike = {
  writeBuffer: (
    buffer: GpuBufferLike,
    bufferOffset: number,
    data: ArrayBufferLike | ArrayBufferView,
  ) => void;
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
  device?: GpuDeviceLike;
  uploadedSpatialVersion?: number;
  uploadedIndirectVersion?: number;
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

export function getWebGPUDeviceFromRenderer(
  renderer: object | null | undefined,
): GpuDeviceLike | null {
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
  usage = GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
): GpuBufferLike | null {
  if (nextBytes <= 0) {
    return null;
  }
  if (existing && existingBytes === nextBytes) {
    return existing;
  }
  return device.createBuffer({
    label,
    size: nextBytes,
    usage,
  });
}

function releaseReplacedBuffers(
  previous: BuildingGpuUploadResources,
  next: BuildingGpuUploadResources,
): void {
  if (previous.spatialBuffer !== next.spatialBuffer) destroyBuffer(previous.spatialBuffer);
  if (previous.metaBuffer !== next.metaBuffer) destroyBuffer(previous.metaBuffer);
  if (previous.indirectArgsBuffer !== next.indirectArgsBuffer)
    destroyBuffer(previous.indirectArgsBuffer);
}

export function syncBuildingGpuBuffers(
  device: GpuDeviceLike,
  previous: BuildingGpuUploadResources,
  mirror: BuildingGpuBufferMirror,
): BuildingGpuUploadResources {
  if (previous.device === device && previous.uploadedSpatialVersion === mirror.version)
    return previous;
  const base =
    previous.device && previous.device !== device
      ? createEmptyBuildingGpuUploadResources()
      : previous;
  const plan = createBuildingGpuUploadPlan(mirror);
  const spatialBytes = mirror.spatial.byteLength;
  const metaBytes = mirror.meta.byteLength;
  let spatialBuffer: GpuBufferLike | null = null;
  let metaBuffer: GpuBufferLike | null = null;
  try {
    spatialBuffer = ensureBuffer(
      device,
      base.spatialBuffer,
      base.spatialBytes,
      spatialBytes,
      'building-spatial',
    );
    metaBuffer = ensureBuffer(device, base.metaBuffer, base.metaBytes, metaBytes, 'building-meta');
    if (spatialBuffer) {
      if (spatialBuffer !== base.spatialBuffer)
        device.queue.writeBuffer(spatialBuffer, 0, mirror.spatial);
      else
        for (const slice of plan.spatial)
          device.queue.writeBuffer(spatialBuffer, slice.byteOffset, slice.data);
    }
    if (metaBuffer) {
      if (metaBuffer !== base.metaBuffer) device.queue.writeBuffer(metaBuffer, 0, mirror.meta);
      else
        for (const slice of plan.meta)
          device.queue.writeBuffer(metaBuffer, slice.byteOffset, slice.data);
    }
  } catch (error) {
    if (spatialBuffer !== base.spatialBuffer) destroyBuffer(spatialBuffer);
    if (metaBuffer !== base.metaBuffer) destroyBuffer(metaBuffer);
    throw error;
  }
  const next: BuildingGpuUploadResources = {
    ...base,
    device,
    backend: 'webgpu',
    uploadedSpatialVersion: mirror.version,
    uploadedVersion: Math.max(base.uploadedVersion, mirror.version),
    spatialBuffer,
    metaBuffer,
    spatialBytes,
    metaBytes,
  };
  releaseReplacedBuffers(previous, next);
  return next;
}

export function syncBuildingIndirectArgsBuffer(
  device: GpuDeviceLike,
  previous: BuildingGpuUploadResources,
  mirror: BuildingIndirectDrawMirror,
): BuildingGpuUploadResources {
  if (previous.device === device && previous.uploadedIndirectVersion === mirror.version)
    return previous;
  const base =
    previous.device && previous.device !== device
      ? createEmptyBuildingGpuUploadResources()
      : previous;
  const plan = createBuildingIndirectDrawUploadPlan(mirror);
  const indirectArgsBytes = mirror.args.byteLength;
  let indirectArgsBuffer: GpuBufferLike | null = null;
  try {
    indirectArgsBuffer = ensureBuffer(
      device,
      base.indirectArgsBuffer,
      base.indirectArgsBytes,
      indirectArgsBytes,
      'building-indirect-args',
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_INDIRECT,
    );
    if (indirectArgsBuffer) {
      if (indirectArgsBuffer !== base.indirectArgsBuffer)
        device.queue.writeBuffer(indirectArgsBuffer, 0, mirror.args);
      else
        for (const slice of plan.slices)
          device.queue.writeBuffer(indirectArgsBuffer, slice.byteOffset, slice.data);
    }
  } catch (error) {
    if (indirectArgsBuffer !== base.indirectArgsBuffer) destroyBuffer(indirectArgsBuffer);
    throw error;
  }
  const next: BuildingGpuUploadResources = {
    ...base,
    device,
    backend: 'webgpu',
    uploadedIndirectVersion: mirror.version,
    uploadedVersion: Math.max(base.uploadedVersion, mirror.version),
    indirectArgsBuffer,
    indirectArgsBytes,
  };
  releaseReplacedBuffers(previous, next);
  return next;
}
