import { useEffect, useMemo, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { logger } from '../../../utils/logger';
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

type GpuDeviceLike =
  ReturnType<typeof getWebGPUDeviceFromRenderer> extends infer T ? Exclude<T, null> : never;
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
  };
}

function destroyBuffer(buffer: GpuBufferLike | null): void {
  if (!buffer?.destroy) return;
  try {
    buffer.destroy();
  } catch (error) {
    logger.warn(
      'Building culling buffer cleanup failed',
      error instanceof Error ? error : String(error),
    );
  }
}

function destroyResources(resources: ComputeResources): void {
  destroyBuffer(resources.uniformBuffer);
  destroyBuffer(resources.visibleBuffer);
  destroyBuffer(resources.readBuffer);
}

function createComputeResources(
  device: GpuDeviceLike,
  spatialBuffer: GpuBufferLike,
  count: number,
): ComputeResources {
  const gpuDevice = device as GpuComputeDevice;
  const shaderModule = gpuDevice.createShaderModule({
    code: `
struct Params {
  planes : array<vec4<f32>, 6>,
  camera : vec4<f32>,
  misc : vec4<f32>,
}

@group(0) @binding(0) var<storage, read> spatial : array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> visible : array<u32>;
@group(0) @binding(3) var<uniform> params : Params;

@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let i = gid.x;
  if (f32(i) >= params.misc.x) {
    return;
  }

  let s = spatial[i];
  var inFrustum = true;
  for (var plane = 0u; plane < 6u; plane += 1u) {
    let p = params.planes[plane];
    if (dot(p.xyz, s.xyz) + p.w < -s.w) {
      inFrustum = false;
      break;
    }
  }

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
  let uniformBuffer: GpuBufferLike | null = null;
  let visibleBuffer: GpuBufferLike | null = null;
  let readBuffer: GpuBufferLike | null = null;
  try {
    uniformBuffer = device.createBuffer({
      label: 'building-cull-uniforms',
      size: 128,
      usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
    }) as GpuBufferLike;
    visibleBuffer = device.createBuffer({
      label: 'building-cull-visible',
      size: Math.max(4, count * 4),
      usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_SRC | GPU_BUFFER_USAGE_COPY_DST,
    }) as GpuBufferLike;
    readBuffer = device.createBuffer({
      label: 'building-cull-readback',
      size: Math.max(4, count * 4),
      usage: GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_MAP_READ,
    }) as GpuBufferLike;

    const bindGroup = gpuDevice.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: spatialBuffer } },
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
    };
  } catch (error) {
    destroyBuffer(uniformBuffer);
    destroyBuffer(visibleBuffer);
    destroyBuffer(readBuffer);
    throw error;
  }
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
    failedDevice: null as GpuDeviceLike | null,
  });

  const scratch = useMemo(
    () => ({
      viewProj: new THREE.Matrix4(),
      frustum: new THREE.Frustum(),
      camera: new THREE.Vector3(),
      uniform: new Float32Array(32),
    }),
    [],
  );

  useEffect(() => {
    const resources = refs.current.resources;
    if (
      resources.count !== snapshot.ids.length ||
      resources.spatialBuffer !== uploadResources.spatialBuffer
    ) {
      destroyResources(resources);
      refs.current.resources = createEmptyResources();
      refs.current.busy = false;
      refs.current.lastRunAt = 0;
    }
  }, [snapshot.ids.length, uploadResources]);

  useFrame((state) => {
    if (snapshot.version === 0 || snapshot.ids.length === 0) return;
    if (uploadResources.backend !== 'webgpu') return;
    const device = getWebGPUDeviceFromRenderer(gl) as GpuDeviceLike | null;
    if (!device || !uploadResources.spatialBuffer) return;
    if (refs.current.failedDevice === device) return;
    if (refs.current.busy) return;

    const now = performance.now();
    if (now - refs.current.lastRunAt < GPU_CULL_INTERVAL_MS) return;
    refs.current.lastRunAt = now;

    if (!refs.current.resources.pipeline) {
      try {
        refs.current.resources = createComputeResources(
          device,
          uploadResources.spatialBuffer,
          snapshot.ids.length,
        );
      } catch (error) {
        refs.current.failedDevice = device;
        reset();
        logger.warn(
          'Building GPU culling unavailable; using CPU visibility',
          error instanceof Error ? error : String(error),
        );
        return;
      }
    }

    const resources = refs.current.resources;
    const uniform = scratch.uniform;
    state.camera.updateWorldMatrix(true, false);
    scratch.viewProj.multiplyMatrices(
      state.camera.projectionMatrix,
      state.camera.matrixWorldInverse,
    );
    state.camera.getWorldPosition(scratch.camera);
    const previous = useBuildingGpuCullingStore.getState();
    const previousCamera = previous.camera;
    if (previous.active && previous.version === snapshot.version && previousCamera &&
      previousCamera.coordinateSystem === state.camera.coordinateSystem &&
      previousCamera.reversedDepth === state.camera.reversedDepth &&
      previousCamera.position[0] === scratch.camera.x &&
      previousCamera.position[1] === scratch.camera.y &&
      previousCamera.position[2] === scratch.camera.z) {
      let unchanged = true;
      for (let index = 0; index < scratch.viewProj.elements.length; index++) {
        if (scratch.viewProj.elements[index] !== previousCamera.viewProjection[index]) {
          unchanged = false;
          break;
        }
      }
      if (unchanged) return;
    }
    scratch.frustum.setFromProjectionMatrix(
      scratch.viewProj,
      state.camera.coordinateSystem,
      state.camera.reversedDepth,
    );
    for (let i = 0; i < scratch.frustum.planes.length; i++) {
      const plane = scratch.frustum.planes[i]!;
      plane.normal.toArray(uniform, i * 4);
      uniform[i * 4 + 3] = plane.constant;
    }
    scratch.camera.toArray(uniform, 24);
    uniform[27] = VISIBILITY_MAX_DISTANCE;
    uniform[28] = snapshot.ids.length;

    if (
      !resources.uniformBuffer ||
      !resources.visibleBuffer ||
      !resources.readBuffer ||
      !resources.bindGroup ||
      !resources.pipeline
    ) {
      return;
    }

    try {
      device.queue.writeBuffer(resources.uniformBuffer, 0, uniform);
      const gpuDevice = device as GpuComputeDevice;
      const encoder = gpuDevice.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(resources.pipeline);
      pass.setBindGroup(0, resources.bindGroup);
      pass.dispatchWorkgroups(Math.max(1, Math.ceil(snapshot.ids.length / WORKGROUP_SIZE)));
      pass.end();
      encoder.copyBufferToBuffer(
        resources.visibleBuffer,
        0,
        resources.readBuffer,
        0,
        Math.max(4, snapshot.ids.length * 4),
      );
      gpuDevice.queue.submit([encoder.finish()]);
    } catch (error) {
      refs.current.failedDevice = device;
      destroyResources(resources);
      refs.current.resources = createEmptyResources();
      reset();
      logger.warn('Building GPU culling submission failed; using CPU visibility',
        error instanceof Error ? error : String(error));
      return;
    }

    refs.current.busy = true;
    const camera = {
      viewProjection: scratch.viewProj.toArray(),
      position: scratch.camera.toArray(),
      coordinateSystem: state.camera.coordinateSystem,
      reversedDepth: state.camera.reversedDepth,
    };
    void Promise.resolve()
      .then(() => {
        if (refs.current.resources !== resources) return;
        return resources.readBuffer?.mapAsync?.(GPU_MAP_MODE_READ);
      })
      .then(() => {
        if (refs.current.resources !== resources) return;
        if (useBuildingRenderStateStore.getState().snapshot !== snapshot) {
          resources.readBuffer?.unmap?.();
          return;
        }
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
        setResult({ ...parsed, camera });
      })
      .catch((error: unknown) => {
        if (refs.current.resources !== resources) return;
        refs.current.failedDevice = device;
        destroyResources(resources);
        refs.current.resources = createEmptyResources();
        refs.current.busy = false;
        if (useBuildingRenderStateStore.getState().snapshot === snapshot) reset();
        logger.warn('Building GPU culling readback failed; using CPU visibility',
          error instanceof Error ? error : String(error));
      })
      .finally(() => {
        if (refs.current.resources === resources) refs.current.busy = false;
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
