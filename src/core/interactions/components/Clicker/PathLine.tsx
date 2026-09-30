import { RefObject, useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useEngineFrame } from '../../../runtime/frame';

const MAX_POINTS = 128;
const UPDATE_INTERVAL_MS = 100;
/** Ribbon width and its lift above the path points, in meters. */
const WIDTH = 0.16;
const LIFT = 0.06;

export type PathLineProps = {
  pointsRef: RefObject<THREE.Vector3[]>;
  color: string;
};

/** Writes the ribbon's two edge vertices per point, each offset sideways from the path on the ground plane. */
export function writeRibbon(points: readonly THREE.Vector3[], count: number, positions: Float32Array): void {
  for (let index = 0; index < count; index += 1) {
    const point = points[index]!;
    const previous = points[Math.max(0, index - 1)]!;
    const next = points[Math.min(count - 1, index + 1)]!;
    let dx = next.x - previous.x;
    let dz = next.z - previous.z;
    const length = Math.hypot(dx, dz) || 1;
    dx /= length;
    dz /= length;
    const sideX = -dz * WIDTH * 0.5;
    const sideZ = dx * WIDTH * 0.5;
    const offset = index * 6;
    positions[offset] = point.x + sideX;
    positions[offset + 1] = point.y + LIFT;
    positions[offset + 2] = point.z + sideZ;
    positions[offset + 3] = point.x - sideX;
    positions[offset + 4] = point.y + LIFT;
    positions[offset + 5] = point.z - sideZ;
  }
}

/**
 * The click-navigation route as a flat ribbon over the ground. A mesh with a basic material draws on WebGPU and WebGL
 * alike; three-stdlib's `Line2` is WebGL-only and made WebGPU fail every draw with an infinite instance count.
 */
export function PathLine({ pointsRef, color }: PathLineProps) {
  const lastUpdateRef = useRef(0);

  const ribbon = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positions);
    const index: number[] = [];
    for (let segment = 0; segment < MAX_POINTS - 1; segment += 1) {
      const a = segment * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geometry.setIndex(index);
    geometry.setDrawRange(0, 0);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    return mesh;
  }, []);

  useEffect(() => {
    ribbon.material.color.set(color);
  }, [ribbon, color]);

  useEffect(() => () => {
    ribbon.geometry.dispose();
    ribbon.material.dispose();
  }, [ribbon]);

  useEngineFrame('lateUpdate', () => {
    const now = performance.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL_MS) return;
    lastUpdateRef.current = now;
    const points = pointsRef.current;
    if (!points || points.length < 2) {
      ribbon.visible = false;
      return;
    }
    const count = Math.min(points.length, MAX_POINTS);
    const positions = ribbon.geometry.getAttribute('position') as THREE.BufferAttribute;
    writeRibbon(points, count, positions.array as Float32Array);
    positions.needsUpdate = true;
    ribbon.geometry.setDrawRange(0, (count - 1) * 6);
    ribbon.visible = true;
  }, { label: 'interactions:path-line' });

  return <primitive object={ribbon} />;
}

PathLine.displayName = 'PathLine';
