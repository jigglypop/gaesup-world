import * as THREE from 'three';

import type { GrassLayout } from './field';
import type { GrassProfile } from '../../../types';

const blades = new Map<string, THREE.BufferGeometry>();

/**
 * A tapered blade, y in [0, 1] and x in [-0.5, 0.5]: two vertices per joint closing to one tip vertex, so `segments`
 * joints make 2 × segments − 1 triangles. Tall blades swell like a leaf.
 */
export function bladeGeometry(segments: number, profile: GrassProfile): THREE.BufferGeometry {
  const key = `${profile}:${segments}`;
  const cached = blades.get(key);
  if (cached) return cached;
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let row = 0; row < segments; row++) {
    const t = row / segments;
    const half = profile === 'tall' ? 0.5 * (1 - t) ** 0.6 * (1 + 0.3 * Math.sin(Math.PI * t)) : 0.5 * (1 - t) ** 0.72;
    for (const side of [-1, 1]) {
      positions.push(side * half, t, 0);
      normals.push(0, 0, 1);
      uvs.push(0.5 + side * 0.5, t);
    }
    if (row) {
      const a = (row - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  positions.push(0, 1, 0);
  normals.push(0, 0, 1);
  uvs.push(0.5, 1);
  const top = (segments - 1) * 2;
  indices.push(top, top + 1, top + 2);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  blades.set(key, geometry);
  return geometry;
}

/**
 * One geometry per joint tier. Each owns copies of the tiny blade buffers, so disposing one layer never drops another's
 * GPU data; the tiers share the layout's instance buffers, which upload once.
 */
export function layoutGeometries(
  layout: GrassLayout,
  profile: GrassProfile,
  segments: readonly number[],
  bounds: THREE.Box3,
): THREE.InstancedBufferGeometry[] {
  const offset = new THREE.InstancedBufferAttribute(layout.offsets, 4);
  const shape = new THREE.InstancedBufferAttribute(layout.shapes, 4);
  const tint = new THREE.InstancedBufferAttribute(layout.tints, 3);
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  return segments.map((count) => {
    const blade = bladeGeometry(count, profile);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setIndex(blade.index!.clone());
    for (const name of ['position', 'normal', 'uv']) geometry.setAttribute(name, blade.getAttribute(name).clone());
    geometry.setAttribute('offset', offset);
    geometry.setAttribute('shape', shape);
    geometry.setAttribute('tint', tint);
    geometry.instanceCount = 0;
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = sphere.clone();
    return geometry;
  });
}
