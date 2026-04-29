import { useEffect, useMemo, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { parseBuildingGpuVisibilityFlags } from '../../render/culling';
import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { useBuildingRenderStateStore } from '../../render/store';
import { getWebGPUDeviceFromRenderer } from '../../render/upload';
import { VISIBILITY_MAX_DISTANCE } from '../../visibility/core';

const GPU_BUFFER_USAGE_MAP_READ = 0x0001;
const GPU_BUFFER_USAGE_COPY_SRC = 0x0004;
const GPU_BUFFER_USAGE_COPY_DST = 0x0008;
const GPU_BUFFER_USAGE_STORAGE = 0x0080;
const GPU_BUFFER_USAGE_UNIFORM = 0x0040;
const GPU_MAP_MODE_READ = 0x0001;
const GPU_CULL_INTERVAL_MS = 180;
const WORKGROUP_SIZE = 64;

type GpuBufferLike = {
  destroy?: () => void;
  mapAsync?: (mode: number) => Promise<void>;
  getMappedRange?: () => ArrayBuffer;
  unmap?: () => void;
};

type GpuDeviceLike = ReturnType<typeof getWebGPUDeviceFromRenderer> extends infer T ? Exclude<T, null> : never;
type GpuShaderModuleLike = object;
type GpuBindGroupLayoutLike = object;
type GpuBindGroupLike = object;
type GpuCommandBufferLike = object;
type GpuComputePassLike = {
  setPipeline: (pipeline: GpuComputePipelineLike) => void;
  setBindGroup: (index: number, bindGroup: GpuBindGroupLike) => void;
  dispatchWorkgroups: (count: number) => void;
  end: () => void;
};
type GpuCommandEncoderLike = {
  beginComputePass: () => GpuComputePassLike;
  copyBufferToBuffer: (
    src: GpuBufferLike,
    srcOffset: number,
    dst: GpuBufferLike,
    dstOffset: number,
    size: number,
  ) => void;
  finish: () => GpuCommandBufferLike;
};
type GpuComputePipelineLike = {
  getBindGroupLayout: (index: number) => GpuBindGroupLayoutLike;
};
type GpuComputeDevice = GpuDeviceLike & {
  createShaderModule: (args: { code: string }) => GpuShaderModuleLike;
  createComputePipeline: (args: {
    layout: 'auto';
    compute: { module: GpuShaderModuleLike; entryPoint: string };
  }) => GpuComputePipelineLike;
  createBindGroup: (args: {
    layout: GpuBindGroupLayoutLike;
    entries: Array<{ binding: number; resource: { buffer: GpuBufferLike } }>;
  }) => GpuBindGroupLike;
  createCommandEncoder: () => GpuCommandEncoderLike;
  queue: GpuDeviceLike['queue'] & { submit: (commands: GpuCommandBufferLike[]) => void };
};

type ComputeResources = {
  pipeline: GpuComputePipelineLike | null;
  bindGroupLayout: GpuBindGroupLayoutLike | null;
  uniformBuffer: GpuBufferLike | null;
  visibleBuffer: GpuBufferLike | null;
  readBuffer: GpuBufferLike | null;
  bindGroup: GpuBindGroupLike | null;
  count: number;
  spatialBuffer: GpuBufferLike | null;
  metaBuffer: GpuBufferLike | null;
};

function createEmptyResources(): ComputeResources {
  return {
    pipeline: null,
    bindGroupLayout: null,
    uniformBuffer: null,
    visibleBuffer: null,
    readBuffer: null,
    bindGroup: null,
    count: 0,
    spatialBuffer: null,
    metaBuffer: null,
  };
}

function destroyBuffer(buffer: GpuBufferLike | null): void {
  if (!buffer?.destroy) return;
  buffer.destroy();
}

function destroyResources(resources: ComputeResources): void {
  destroyBuffer(resources.uniformBuffer);
  destroyBuffer(resources.visibleBuffer);
  destroyBuffer(resources.readBuffer);
}

function createComputeResources(
  device: GpuDeviceLike,
  spatialBuffer: GpuBufferLike,
  metaBuffer: GpuBufferLike,
  count: number,
): ComputeResources {
  const gpuDevice = device as GpuComputeDevice;
  const shaderModule = gpuDevice.createShaderModule({
    code: `
struct Params {
  viewProj : mat4x4<f32>,
  camera : vec4<f32>,
  misc : vec4<f32>,
}

@group(0) @binding(0) var<storage, read> spatial : array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> meta : array<vec4<i32>>;
@group(0) @binding(2) var<storage, read_write> visible : array<u32>;
@group(0) @binding(3) var<uniform> params : Params;

@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let i = gid.x;
  if (f32(i) >= params.misc.x) {
    return;
  }

  let s = spatial[i];
  let world = vec4<f32>(s.x, s.y, s.z, 1.0);
  let clip = params.viewProj * world;
  let w = clip.w;
  if (w <= 0.0) {
    visible[i] = 0u;
    return;
  }

  let inflate = s.w / max(abs(w), 0.0001);
  let ndc = clip.xyz / w;
  let inFrustum =
    ndc.x >= (-1.0 - inflate) &&
    ndc.x <= ( 1.0 + inflate) &&
    ndc.y >= (-1.0 - inflate) &&
    ndc.y <= ( 1.0 + inflate) &&
    ndc.z >= (-inflate) &&
    ndc.z <= ( 1.0 + inflate);

  let dx = s.x - params.camera.x;
  let dy = s.y - params.camera.y;
  let dz = s.z - params.camera.z;
  let limit = params.camera.w + s.w;
  let inRange = dx * dx + dy * dy + dz * dz <= limit * limit;

  visible[i] = select(0u, 1u, inFrustum && inRange);
}
`,
  });

  const pipeline = gpuDevice.createComputePipeline({
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'main' },
  });

  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  const uniformBuffer = device.createBuffer({
    label: 'building-cull-uniforms',
    size: 96,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
  }) as GpuBufferLike;
  const visibleBuffer = device.createBuffer({
    label: 'building-cull-visible',
    size: Math.max(4, count * 4),
    usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_SRC | GPU_BUFFER_USAGE_COPY_DST,
  }) as GpuBufferLike;
  const readBuffer = device.createBuffer({
    label: 'building-cull-readback',
    size: Math.max(4, count * 4),
    usage: GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_MAP_READ,
  }) as GpuBufferLike;

  const bindGroup = gpuDevice.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: spatialBuffer } },
      { binding: 1, resource: { buffer: metaBuffer } },
      { binding: 2, resource: { buffer: visibleBuffer } },
      { binding: 3, resource: { buffer: uniformBuffer } },
    ],
  });

  return {
    pipeline,
    bindGroupLayout,
    uniformBuffer,
    visibleBuffer,
    readBuffer,
    bindGroup,
    count,
    spatialBuffer,
    metaBuffer,
  };
}

export function BuildingGpuCullingDriver() {
  const gl = useThree((s) => s.gl);
  const snapshot = useBuildingRenderStateStore((s) => s.snapshot);
  const uploadResources = useBuildingRenderStateStore((s) => s.uploadResources);
  const setResult = useBuildingGpuCullingStore((s) => s.setResult);
  const reset = useBuildingGpuCullingStore((s) => s.reset);

  const refs = useRef({
    resources: createEmptyResources(),
    busy: false,
    lastRunAt: 0,
    readbackFlags: null as Uint32Array | null,
  });

  const scratch = useMemo(
    () => ({
      viewProj: new THREE.Matrix4(),
      uniform: new Float32Array(24),
    }),
    [],
  );

  useEffect(() => reset, [reset]);

  useEffect(() => {
    const resources = refs.current.resources;
    if (
      resources.count !== snapshot.ids.length ||
      resources.spatialBuffer !== uploadResources.spatialBuffer ||
      resources.metaBuffer !== uploadResources.metaBuffer
    ) {
      destroyResources(resources);
      refs.current.resources = createEmptyResources();
    }
  }, [snapshot.ids.length, uploadResources]);

  useFrame((state) => {
    if (snapshot.version === 0 || snapshot.ids.length === 0) return;
    if (uploadResources.backend !== 'webgpu') return;
    const device = getWebGPUDeviceFromRenderer(gl) as GpuDeviceLike | null;
    if (!device || !uploadResources.spatialBuffer || !uploadResources.metaBuffer) return;
    if (refs.current.busy) return;

    const now = performance.now();
    if (now - refs.current.lastRunAt < GPU_CULL_INTERVAL_MS) return;
    refs.current.lastRunAt = now;

    if (!refs.current.resources.pipeline) {
      refs.current.resources = createComputeResources(
        device,
        uploadResources.spatialBuffer,
        uploadResources.metaBuffer,
        snapshot.ids.length,
      );
    }

    const resources = refs.current.resources;
    const uniform = scratch.uniform;
    scratch.viewProj.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
    uniform.set(scratch.viewProj.elements, 0);
    uniform[16] = state.camera.position.x;
    uniform[17] = state.camera.position.y;
    uniform[18] = state.camera.position.z;
    uniform[19] = VISIBILITY_MAX_DISTANCE;
    uniform[20] = snapshot.ids.length;
    uniform[21] = 0;
    uniform[22] = 0;
    uniform[23] = 0;

    if (!resources.uniformBuffer || !resources.visibleBuffer || !resources.readBuffer || !resources.bindGroup || !resources.pipeline) {
      return;
    }

    device.queue.writeBuffer(resources.uniformBuffer, 0, uniform);

    const gpuDevice = device as GpuComputeDevice;
    const encoder = gpuDevice.createCommandEncoder();

    const pass = encoder.beginComputePass();
    pass.setPipeline(resources.pipeline);
    pass.setBindGroup(0, resources.bindGroup);
    pass.dispatchWorkgroups(Math.max(1, Math.ceil(snapshot.ids.length / WORKGROUP_SIZE)));
    pass.end();
    encoder.copyBufferToBuffer(resources.visibleBuffer, 0, resources.readBuffer, 0, Math.max(4, snapshot.ids.length * 4));
    gpuDevice.queue.submit([encoder.finish()]);

    refs.current.busy = true;
    void Promise.resolve(resources.readBuffer?.mapAsync?.(GPU_MAP_MODE_READ))
      .then(() => {
        const mapped = resources.readBuffer?.getMappedRange?.();
        if (!mapped) return;
        const count = snapshot.ids.length;
        const mappedFlags = new Uint32Array(mapped, 0, count);
        if (!refs.current.readbackFlags || refs.current.readbackFlags.length < count) {
          refs.current.readbackFlags = new Uint32Array(count);
        }
        const copy = refs.current.readbackFlags;
        copy.set(mappedFlags);
        resources.readBuffer?.unmap?.();
        const parsed = parseBuildingGpuVisibilityFlags(snapshot, copy);
        setResult(parsed);
      })
      .catch(() => {
        reset();
      })
      .finally(() => {
        refs.current.busy = false;
      });
  });

  useEffect(() => {
    return () => {
      destroyResources(refs.current.resources);
      refs.current.resources = createEmptyResources();
      reset();
    };
  }, [reset]);

  return null;
}

export default BuildingGpuCullingDriver;
