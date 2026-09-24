import { Mesh, Vector4 } from 'three';
import type { BufferAttribute, BufferGeometry } from 'three';
import type { WebGPURenderer } from 'three/webgpu';

import { isGpuBatchRevision } from '../../core/rendering/gpuBatchRevision';

export type GpuDrivenInstancesOptions = {
  /** An initialized native WebGPU renderer. The caller retains ownership. */
  renderer: WebGPURenderer;
  geometry: BufferGeometry;
  /** Immutable world-space translations, xyz per instance. */
  positions: Float32Array;
  /** Bounding sphere radius, including the geometry's offset from its origin. */
  radius: number;
  color?: number;
};

/**
 * GPU frustum compaction and indirect drawing for static translated meshes.
 * Keep the returned mesh at identity; culling uses world-space translations.
 * Owns a geometry clone, material, storage attributes and compute kernels.
 */
export async function createGpuDrivenInstances(options: GpuDrivenInstancesOptions) {
  const { renderer, positions, radius } = options;
  const backend = renderer.backend as { isWebGPUBackend?: boolean };
  if (!backend.isWebGPUBackend) return null;
  const count = positions.length / 3;
  if (!Number.isInteger(count) || count < 1 || !Number.isFinite(radius) || radius < 0) {
    throw new RangeError('Expected nonempty xyz positions and a finite nonnegative radius.');
  }
  const position = options.geometry.getAttribute('position');
  const range = options.geometry.drawRange;
  if (
    !position ||
    !Number.isInteger(range.start) ||
    range.start < 0 ||
    (range.count !== Infinity && (!Number.isInteger(range.count) || range.count < 0))
  ) {
    throw new RangeError('Expected position geometry and a nonnegative integer draw range.');
  }
  const totalElements = options.geometry.index?.count ?? position.count;
  const firstElement = Math.min(range.start, totalElements);
  const elementCount = Math.min(range.count, totalElements - firstElement);
  const [gpu, tsl] = await Promise.all([import('three/webgpu'), import('three/tsl')]);
  // The public package also supports older Three versions without indirect draws.
  if (
    typeof gpu.IndirectStorageBufferAttribute !== 'function' ||
    typeof options.geometry.setIndirect !== 'function'
  )
    return null;
  const owner = renderer as unknown as {
    _attributes?: { delete(attribute: BufferAttribute): unknown };
  };
  // r185 BufferAttribute.dispose() dispatches an event but the storage manager
  // does not listen to it. Only enable the version whose teardown is verified.
  if (!isGpuBatchRevision() || !owner._attributes) return null;
  // vec4 keeps the CPU packing aligned with WGSL storage array stride.
  const packed = new Float32Array(count * 4);
  for (let i = 0; i < count; i += 1) {
    if (
      !Number.isFinite(positions[i * 3]) ||
      !Number.isFinite(positions[i * 3 + 1]) ||
      !Number.isFinite(positions[i * 3 + 2])
    )
      throw new RangeError('Instance positions must be finite.');
    packed[i * 4] = positions[i * 3] ?? 0;
    packed[i * 4 + 1] = positions[i * 3 + 1] ?? 0;
    packed[i * 4 + 2] = positions[i * 3 + 2] ?? 0;
  }
  const geometry = options.geometry.clone();
  const positionAttribute = new gpu.StorageBufferAttribute(packed, 4);
  const visibleAttribute = new gpu.StorageBufferAttribute(new Uint32Array(count), 1);
  const indirect = new gpu.IndirectStorageBufferAttribute(
    new Uint32Array(
      geometry.index ? [elementCount, 0, firstElement, 0, 0] : [elementCount, 0, firstElement, 0],
    ),
    1,
  );
  const positionsNode = tsl.storage(positionAttribute, 'vec4', count).toReadOnly();
  const visibleNode = tsl.storage(visibleAttribute, 'uint', count);
  const argsNode = tsl.storage(indirect, 'uint', indirect.count).toAtomic();
  const planeVectors = Array.from({ length: 6 }, () => new Vector4());
  const planesNode = tsl.uniformArray<'vec4'>(planeVectors, 'vec4');
  const reset = tsl
    .Fn(() => {
      tsl.atomicStore(argsNode.element(1), 0);
    })()
    .compute(1);
  const cull = tsl
    .Fn(() => {
      const position = positionsNode.element(tsl.instanceIndex).xyz;
      const visible = tsl.bool(true).toVar();
      for (let i = 0; i < 6; i += 1) {
        const plane = planesNode.element(i);
        tsl.If(plane.xyz.dot(position).add(plane.w).lessThan(-radius), () => {
          visible.assign(tsl.bool(false));
        });
      }
      tsl.If(visible, () => {
        const slot = tsl.atomicAdd(argsNode.element(1), 1).toVar();
        visibleNode.element(slot).assign(tsl.instanceIndex);
      });
    })()
    .compute(count);
  const material = new gpu.MeshStandardNodeMaterial({
    color: options.color ?? 0x6ac8a4,
    roughness: 0.8,
  });
  material.positionNode = tsl.positionLocal.add(
    positionsNode.element(
      tsl.storage(visibleAttribute, 'uint', count).toReadOnly().element(tsl.instanceIndex),
    ).xyz,
  );
  geometry.setIndirect(indirect);
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const kernels = [reset, cull];
  const previousPlanes = new Float32Array(24);
  let hasPreviousPlanes = false;
  let disposed = false;
  return {
    mesh,
    count,
    /** Call after updating the camera and before rendering. No CPU readback. */
    update(planes: Float32Array): void {
      if (disposed) return;
      if (planes.length !== 24) throw new RangeError('Expected six normalized frustum planes.');
      // Translations/radius are immutable; an unchanged frustum has the same compacted draw.
      if (hasPreviousPlanes) {
        let changed = false;
        for (let i = 0; i < 24; i += 1) {
          if (planes[i] !== previousPlanes[i]) { changed = true; break; }
        }
        if (!changed) return;
      }
      for (let i = 0; i < 6; i += 1) {
        planeVectors[i]?.fromArray(planes, i * 4);
      }
      renderer.compute(kernels);
      previousPlanes.set(planes);
      hasPreviousPlanes = true;
    },
    /** Optional asynchronous telemetry; never needed for the render loop. */
    async readVisibleCount(): Promise<number> {
      if (disposed) throw new Error('GPU instances have been disposed.');
      const buffer = await renderer.getArrayBufferAsync(indirect);
      return new Uint32Array(buffer)[1] ?? 0;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      mesh.removeFromParent();
      reset.dispose();
      cull.dispose();
      geometry.dispose();
      material.dispose();
      // Three r185 does not release compute storage through geometry.dispose().
      // Keep its internal ownership boundary isolated here, including Info accounting.
      for (const attribute of [positionAttribute, visibleAttribute, indirect]) {
        owner._attributes?.delete(attribute);
      }
    },
  };
}

export type GpuDrivenInstances = NonNullable<Awaited<ReturnType<typeof createGpuDrivenInstances>>>;
