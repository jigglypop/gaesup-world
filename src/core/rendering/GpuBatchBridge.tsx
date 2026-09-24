import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import { Frustum, InstancedMesh, Matrix4 } from 'three';
import type { CoordinateSystem, Group, Material, Object3D } from 'three';
import type { WebGPURenderer } from 'three/webgpu';

import { isGpuBatchRevision } from './gpuBatchRevision';
import { createGpuInstanceBatch, type GpuInstanceBatch } from './gpuInstanceBatch';
import { supportsGpuBatchMaterial } from './gpuMaterialSync';
import { invalidateRenderHistory } from './renderHistory';
import { logger } from '../utils/logger';

type RenderCallback = NonNullable<ReturnType<WebGPURenderer['getRenderObjectFunction']>>;
const filters = new WeakMap<
  WebGPURenderer,
  {
    sources: Set<Object3D>;
    refs: number;
    previous: ReturnType<WebGPURenderer['getRenderObjectFunction']>;
    callback: RenderCallback;
  }
>();

function acquireFilter(renderer: WebGPURenderer) {
  let entry = filters.get(renderer);
  if (!entry) {
    const sources = new Set<Object3D>();
    const previous = renderer.getRenderObjectFunction();
    const render = previous ?? renderer.renderObject.bind(renderer);
    const callback: RenderCallback = (...args) => {
      // Three's shadow pass installs its own callback and renders the original instances.
      if (!sources.has(args[0])) render(...args);
    };
    entry = { sources, refs: 0, previous, callback };
    filters.set(renderer, entry);
    renderer.setRenderObjectFunction(callback);
  }
  entry.refs++;
  const current = entry;
  return {
    sources: current.sources,
    release() {
      if (--current.refs !== 0) return;
      if (renderer.getRenderObjectFunction() === current.callback)
        renderer.setRenderObjectFunction(current.previous);
      filters.delete(renderer);
    },
  };
}

export function supportsGpuInstanceBatches(renderer: unknown): renderer is WebGPURenderer {
  const value = renderer as {
    backend?: { isWebGPUBackend?: boolean };
    _attributes?: unknown;
  } | null;
  return isGpuBatchRevision() && value?.backend?.isWebGPUBackend === true && !!value._attributes;
}

function supportsAllGpuBatchMaterials(material: InstancedMesh['material']): boolean {
  if (!Array.isArray(material)) return supportsGpuBatchMaterial(material);
  for (let i = 0; i < material.length; i++) if (!supportsGpuBatchMaterial(material[i]!)) return false;
  return true;
}

function materialsReplaced(materials: Material[], current: InstancedMesh['material']): boolean {
  if (Array.isArray(current) ? current.length !== materials.length : materials.length !== 1) return true;
  for (let i = 0; i < materials.length; i++) {
    if (materials[i] !== (Array.isArray(current) ? current[i] : current)) return true;
  }
  return false;
}

/** Accelerates material batches under one world root, retaining original picking and shadow meshes. */
export function GpuBatchBridge({
  root,
  enabled = true,
}: {
  root: RefObject<Group | null>;
  enabled?: boolean;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const tick = useRef<
    ((camera: Matrix4, coordinateSystem: CoordinateSystem, reversed: boolean) => void) | null
  >(null);
  const [projection] = useState(() => new Matrix4());

  useEffect(() => {
    const group = root.current;
    if (!group || !enabled || !supportsGpuInstanceBatches(gl)) return;
    const renderer = gl;
    const filter = acquireFilter(renderer);
    const registry = new Set<InstancedMesh>();
    const attached = new Set<Object3D>();
    const batches = new Map<InstancedMesh, GpuInstanceBatch>();
    const pending = new Map<InstancedMesh, object>();
    const signatures = new Map<
      InstancedMesh,
      {
        geometry: InstancedMesh['geometry'];
        material: InstancedMesh['material'];
        matrix: InstancedMesh['instanceMatrix'];
        color: InstancedMesh['instanceColor'];
        materials: Material[];
      }
    >();
    const unsupported = new Set<InstancedMesh>();
    const frustum = new Frustum();
    const planes = new Float32Array(24);
    let disposed = false;
    const release = (source: InstancedMesh) => {
      if (batches.has(source)) invalidateRenderHistory(scene);
      filter.sources.delete(source);
      batches.get(source)?.dispose();
      batches.delete(source);
      pending.delete(source);
      signatures.delete(source);
      unsupported.delete(source);
    };
    const add = (object: Object3D) => {
      if (attached.has(object)) return;
      attached.add(object);
      object.addEventListener('childadded', added);
      object.addEventListener('childremoved', removed);
      if (object instanceof InstancedMesh && object.name.startsWith('building-batch:'))
        registry.add(object);
      for (const child of object.children) add(child);
    };
    const remove = (object: Object3D) => {
      object.removeEventListener('childadded', added);
      object.removeEventListener('childremoved', removed);
      attached.delete(object);
      if (object instanceof InstancedMesh) {
        registry.delete(object);
        release(object);
      }
      for (const child of [...object.children]) remove(child);
    };
    const added = (event: { child: Object3D }) => add(event.child);
    const removed = (event: { child: Object3D }) => remove(event.child);
    add(group);
    tick.current = (matrix, coordinateSystem, reversed) => {
      frustum.setFromProjectionMatrix(matrix, coordinateSystem, reversed);
      for (let i = 0; i < 6; i++) {
        const plane = frustum.planes[i]!;
        const offset = i * 4;
        planes[offset] = plane.normal.x;
        planes[offset + 1] = plane.normal.y;
        planes[offset + 2] = plane.normal.z;
        planes[offset + 3] = plane.constant;
      }
      for (const source of registry) {
        if (!supportsAllGpuBatchMaterials(source.material)) {
          release(source);
          continue;
        }
        // Count, instance and material-version changes update the batch in place; only a new geometry, material
        // or instance buffer (capacity growth) rebuilds it.
        const signature = signatures.get(source);
        if (
          signature &&
          (signature.geometry !== source.geometry ||
            signature.material !== source.material ||
            signature.matrix !== source.instanceMatrix ||
            signature.color !== source.instanceColor ||
            materialsReplaced(signature.materials, source.material))
        )
          release(source);
        const batch = batches.get(source);
        if (batch) {
          try {
            if (batch.update(planes)) invalidateRenderHistory(scene);
            filter.sources.add(source);
          } catch (error) {
            release(source);
            unsupported.add(source);
            logger.warn('GPU batch update failed; original mesh retained', String(error));
          }
        } else if (!pending.has(source) && !unsupported.has(source) && source.count > 0) {
          const token = {};
          pending.set(source, token);
          const materials = Array.isArray(source.material)
            ? [...source.material]
            : [source.material];
          signatures.set(source, {
            geometry: source.geometry,
            material: source.material,
            matrix: source.instanceMatrix,
            color: source.instanceColor,
            materials,
          });
          void createGpuInstanceBatch(renderer, source)
            .then((created) => {
              if (disposed || pending.get(source) !== token || !source.parent) {
                created?.dispose();
                return;
              }
              pending.delete(source);
              if (!created || created.meshes.length === 0) {
                created?.dispose();
                unsupported.add(source);
                return;
              }
              for (const mesh of created.meshes) source.parent.add(mesh);
              batches.set(source, created);
            })
            .catch((error) => {
              if (pending.get(source) !== token) return;
              pending.delete(source);
              unsupported.add(source);
              logger.warn('GPU batching unavailable; original mesh retained', String(error));
            });
        }
      }
    };
    return () => {
      disposed = true;
      tick.current = null;
      remove(group);
      filter.release();
    };
  }, [gl, scene, root, enabled]);

  useFrame(({ camera }) => {
    if (!tick.current) return;
    camera.updateWorldMatrix(true, false);
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    tick.current(projection, camera.coordinateSystem, camera.reversedDepth);
  });
  return null;
}
