import { Matrix4, Mesh, Sphere, Vector4 } from 'three';
import type { BufferAttribute, InstancedMesh, Material } from 'three';
import type { NodeMaterial, WebGPURenderer } from 'three/webgpu';

import { isGpuBatchRevision } from './gpuBatchRevision';
import { createMaterialSynchronizer, supportsGpuBatchMaterial } from './gpuMaterialSync';

const MATRIX_SIZE = 16;

function matrixChanged(from: ArrayLike<number>, to: Float32Array, offset: number): boolean {
  for (let i = offset, end = offset + MATRIX_SIZE; i < end; i++) if (from[i] !== to[i]) return true;
  return false;
}

/**
 * Renderer-owned acceleration. Source instances remain the picking/physics/shadow authority.
 * GPU buffers are sized by the source's instance capacity, so count changes and edits upload only the instances
 * that changed instead of rebuilding the batch.
 */
export async function createGpuInstanceBatch(renderer: WebGPURenderer, source: InstancedMesh) {
  const owner = renderer as unknown as {
    _attributes?: { delete(attribute: BufferAttribute): unknown };
  };
  if (
    !(renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ||
    !isGpuBatchRevision() ||
    !owner._attributes ||
    source.count < 1
  )
    return null;
  const originals = Array.isArray(source.material) ? source.material : [source.material];
  // Custom vertex deformation and ordered transparency keep their existing renderer path.
  if (originals.some(material => !supportsGpuBatchMaterial(material)))
    return null;
  const [gpu, t] = await Promise.all([import('three/webgpu'), import('three/tsl')]);
  const capacity = source.instanceMatrix.count;
  const matrices = new gpu.StorageBufferAttribute(new Float32Array(capacity * MATRIX_SIZE), MATRIX_SIZE);
  const bounds = new gpu.StorageBufferAttribute(new Float32Array(capacity * 4), 4);
  const visible = new gpu.StorageBufferAttribute(new Uint32Array(capacity), 1);
  const visibleNode = t.storage(visible, 'uint', capacity);
  const matrixNode = t.storage(matrices, 'mat4', capacity).toReadOnly();
  const boundsNode = t.storage(bounds, 'vec4', capacity).toReadOnly();
  const colors = source.instanceColor
    ? new gpu.StorageBufferAttribute(new Float32Array(capacity * 4), 4)
    : null;
  const planes = Array.from({ length: 6 }, () => new Vector4());
  const planeNode = t.uniformArray<'vec4'>(planes, 'vec4');
  const parts: Array<{
    mesh: Mesh;
    indirect: InstanceType<typeof gpu.IndirectStorageBufferAttribute>;
    syncMaterial: () => void;
  }> = [];
  const rawGroups = Array.isArray(source.material)
    ? source.geometry.groups
    : [{ start: 0, count: Infinity, materialIndex: 0 }];
  const groups: Array<{ start: number; count: number; materialIndex: number }> = [];
  for (const group of rawGroups) {
    const previous = groups[groups.length - 1];
    const materialIndex = group.materialIndex ?? 0;
    if (
      previous &&
      previous.start + previous.count === group.start &&
      originals[previous.materialIndex] === originals[materialIndex]
    )
      previous.count += group.count;
    else groups.push({ start: group.start, count: group.count, materialIndex });
  }
  const elementTotal =
    source.geometry.index?.count ?? source.geometry.getAttribute('position').count;
  const allocations: BufferAttribute[] = [matrices, bounds, visible, ...(colors ? [colors] : [])];
  const materials: Material[] = [];
  const releaseParts = () => {
    for (const { mesh } of parts) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    for (const material of materials) material.dispose();
    for (const allocation of allocations) owner._attributes!.delete(allocation);
  };
  const indexNode = t.storage(visible, 'uint', capacity).toReadOnly().element(t.instanceIndex);
  const instanceMatrix = matrixNode.element(indexNode);
  try {
    for (const group of groups) {
      const original = originals[group.materialIndex ?? 0];
      if (!original) {
        releaseParts();
        return null;
      }
      const material = (
        renderer.library as unknown as { fromMaterial(material: Material): NodeMaterial | null }
      ).fromMaterial(original.clone());
      if (!material) {
        releaseParts();
        return null;
      }
      materials.push(material);
      material.positionNode = t.Fn(() => {
        // Compacted draw slots can reorder. Previous position must use the stable
        // source instance too, otherwise TRAA treats every instance as the origin.
        t.positionPrevious.assign(instanceMatrix.mul(t.vec4(t.positionGeometry, 1)).xyz);
        return instanceMatrix.mul(t.vec4(t.positionLocal, 1)).xyz;
      })();
      material.normalNode = t.transformNormalToView(
        t.transformNormal(t.normalLocal, instanceMatrix),
      );
      if (colors)
        material.colorNode = t.materialColor.mul(
          t.storage(colors, 'vec4', capacity).toReadOnly().element(indexNode).xyz,
        );
      const geometry = source.geometry.clone();
      geometry.clearGroups();
      const start = Math.max(group.start, source.geometry.drawRange.start);
      const end = Math.min(
        group.start + group.count,
        source.geometry.drawRange.start + source.geometry.drawRange.count,
        elementTotal,
      );
      const length = Math.max(0, end - start);
      const indirect = new gpu.IndirectStorageBufferAttribute(
        new Uint32Array(source.geometry.index ? [length, 0, start, 0, 0] : [length, 0, start, 0]),
        1,
      );
      allocations.push(indirect);
      geometry.setIndirect(indirect);
      const mesh = new Mesh(geometry, material);
      mesh.name = `gpu-resident:${source.name || source.uuid}:${group.materialIndex ?? 0}`;
      mesh.matrixAutoUpdate = false;
      mesh.frustumCulled = false;
      mesh.receiveShadow = source.receiveShadow;
      mesh.raycast = () => {}; // Picking is resolved against stable source instance IDs.
      mesh.userData['intangible'] = true;
      parts.push({ mesh, indirect, syncMaterial: createMaterialSynchronizer(original, material) });
    }
  } catch (error) {
    releaseParts();
    throw error;
  }
  const args = parts.map((part) =>
    t.storage(part.indirect, 'uint', part.indirect.count).toAtomic(),
  );
  const reset = t
    .Fn(() => {
      for (const arg of args) t.atomicStore(arg.element(1), 0);
    })()
    .compute(1);
  const cull = t
    .Fn(() => {
      const sphere = boundsNode.element(t.instanceIndex);
      const keep = t.bool(true).toVar();
      for (let i = 0; i < 6; i++) {
        const plane = planeNode.element(i);
        t.If(plane.xyz.dot(sphere.xyz).add(plane.w).lessThan(sphere.w.negate()), () => {
          keep.assign(t.bool(false));
        });
      }
      t.If(keep, () => {
        const first = args[0];
        if (!first) return;
        const slot = t.atomicAdd(first.element(1), 1).toVar();
        visibleNode.element(slot).assign(t.instanceIndex);
        for (let i = 1; i < args.length; i++) t.atomicAdd(args[i]!.element(1), 1);
      });
    })()
    .compute(source.count);
  const kernels = [reset, cull];
  const local = new Matrix4();
  const world = new Matrix4();
  const sphere = new Sphere();
  const previousWorld = new Matrix4();
  const previousPlanes = new Float32Array(24);
  const matrixArray = matrices.array as Float32Array;
  const boundsArray = bounds.array as Float32Array;
  let version = -1;
  let colorVersion = -1;
  let count = -1;
  let initialized = false;
  let disposed = false;
  source.geometry.computeBoundingSphere();
  const writeBounds = (i: number) => {
    source.getMatrixAt(i, local);
    world.multiplyMatrices(source.matrixWorld, local);
    sphere.copy(source.geometry.boundingSphere!).applyMatrix4(world);
    boundsArray[i * 4] = sphere.center.x;
    boundsArray[i * 4 + 1] = sphere.center.y;
    boundsArray[i * 4 + 2] = sphere.center.z;
    boundsArray[i * 4 + 3] = sphere.radius;
  };
  return {
    source,
    meshes: parts.map((part) => part.mesh),
    get count() {
      return count;
    },
    update(frustum: Float32Array): boolean {
      if (disposed) return false;
      source.updateWorldMatrix(true, false);
      const moved = !previousWorld.equals(source.matrixWorld);
      const changed = moved || version !== source.instanceMatrix.version || count !== source.count;
      if (changed) {
        count = Math.min(source.count, capacity);
        const from = source.instanceMatrix.array;
        let first = count;
        let last = -1;
        for (let i = 0; i < count; i++) {
          const offset = i * MATRIX_SIZE;
          if (!matrixChanged(from, matrixArray, offset)) {
            if (moved) writeBounds(i);
            continue;
          }
          for (let j = offset; j < offset + MATRIX_SIZE; j++) matrixArray[j] = from[j]!;
          writeBounds(i);
          if (i < first) first = i;
          last = i;
        }
        if (last >= first) {
          matrices.addUpdateRange(first * MATRIX_SIZE, (last - first + 1) * MATRIX_SIZE);
          matrices.needsUpdate = true;
        }
        if (moved) bounds.clearUpdateRanges();
        else if (last >= first) bounds.addUpdateRange(first * 4, (last - first + 1) * 4);
        if (moved || last >= first) bounds.needsUpdate = true;
        cull.count = count;
        version = source.instanceMatrix.version;
        previousWorld.copy(source.matrixWorld);
      }
      if (colors && source.instanceColor && colorVersion !== source.instanceColor.version) {
        for (let i = 0; i < count; i++) {
          const offset = i * 4;
          colors.array[offset] = source.instanceColor.getX(i);
          colors.array[offset + 1] = source.instanceColor.getY(i);
          colors.array[offset + 2] = source.instanceColor.getZ(i);
          colors.array[offset + 3] = 1;
        }
        colors.needsUpdate = true;
        colorVersion = source.instanceColor.version;
      }
      let cameraChanged = !initialized;
      for (let i = 0; i < 24 && !cameraChanged; i++)
        cameraChanged = previousPlanes[i] !== frustum[i];
      for (const part of parts) {
        part.syncMaterial();
        part.mesh.matrix.copy(source.matrix);
        part.mesh.layers.mask = source.layers.mask;
        part.mesh.visible = source.visible;
        part.mesh.renderOrder = source.renderOrder;
      }
      if (!changed && !cameraChanged) return false;
      for (let i = 0; i < 6; i++) planes[i]!.fromArray(frustum, i * 4);
      renderer.compute(kernels);
      previousPlanes.set(frustum);
      initialized = true;
      return changed;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      reset.dispose();
      cull.dispose();
      releaseParts();
    },
  };
}

export type GpuInstanceBatch = NonNullable<Awaited<ReturnType<typeof createGpuInstanceBatch>>>;
