import { useEffect, useMemo } from 'react';

import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

import { createToonMaterial, getDefaultToonMode } from '@core/rendering/toon';

const noise2D = createNoise2D();

type SandProps = {
  size?: number;
  toon?: boolean;
};

let _sandSurfaceToon: THREE.MeshToonMaterial | null = null;
let _sandSurfacePbr: THREE.MeshStandardMaterial | null = null;

function getSandSurfaceMaterial(toon: boolean): THREE.Material {
  if (toon) {
    if (!_sandSurfaceToon) {
      _sandSurfaceToon = createToonMaterial({ vertexColors: true, steps: 4 });
    }
    return _sandSurfaceToon;
  }
  if (!_sandSurfacePbr) {
    _sandSurfacePbr = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0.02 });
  }
  return _sandSurfacePbr;
}

function hash01(value: number): number {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function getSandHeight(x: number, z: number, size: number): number {
  const safeSize = Math.max(size, 1);
  const duneA = noise2D(x / (safeSize * 0.8), z / (safeSize * 0.8)) * 0.07;
  const duneB = noise2D(x / (safeSize * 0.32) + 8.3, z / (safeSize * 0.42) - 5.4) * 0.025;
  const ripple = Math.sin(x * 1.35 + z * 0.42) * 0.01;
  const moundA = Math.exp(-(((x + safeSize * 0.18) * (x + safeSize * 0.18) + (z - safeSize * 0.08) * (z - safeSize * 0.08)) / Math.max(safeSize * safeSize * 0.55, 1))) * 0.09;
  const moundB = Math.exp(-(((x - safeSize * 0.24) * (x - safeSize * 0.24) + (z + safeSize * 0.16) * (z + safeSize * 0.16)) / Math.max(safeSize * safeSize * 0.7, 1))) * 0.05;
  return 0.025 + duneA + duneB + ripple + moundA + moundB;
}

// ============================================================
// SandBatch -- renders ALL sand tiles with 2 draw calls
// ============================================================

export type SandEntry = {
  position: [number, number, number];
  size: number;
};

function buildMergedSand(entries: SandEntry[]): [THREE.BufferGeometry, THREE.BufferGeometry, number] {
  let totalVerts = 0, totalIdx = 0, totalGrains = 0;
  const segList: number[] = [];
  const grainList: number[] = [];

  for (const e of entries) {
    const segs = Math.max(20, Math.round(e.size * 6));
    segList.push(segs);
    totalVerts += (segs + 1) * (segs + 1);
    totalIdx += segs * segs * 6;
    const gc = Math.max(90, Math.min(240, Math.round(e.size * e.size * 10)));
    grainList.push(gc);
    totalGrains += gc;
  }

  const pos = new Float32Array(totalVerts * 3);
  const col = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(totalIdx);

  let vOff = 0, iOff = 0;

  for (let ei = 0; ei < entries.length; ei++) {
    const e = entries[ei];
    const segs = segList[ei];
    if (!e || segs === undefined) continue;
    const s = e.size;
    const ox = e.position[0], oy = e.position[1] + 0.04, oz = e.position[2];

    for (let iz = 0; iz <= segs; iz++) {
      for (let ix = 0; ix <= segs; ix++) {
        const vi = vOff + iz * (segs + 1) + ix;
        const lx = (ix / segs - 0.5) * s;
        const lz = (iz / segs - 0.5) * s;
        const y = getSandHeight(lx, lz, s);
        const tint = 0.5 + 0.5 * noise2D(lx * 0.22 + 5.1, lz * 0.22 - 3.6);
        const vi3 = vi * 3;
        pos[vi3] = lx + ox;
        pos[vi3 + 1] = y + oy;
        pos[vi3 + 2] = lz + oz;
        col[vi3] = 0.72 + tint * 0.09;
        col[vi3 + 1] = 0.61 + tint * 0.07;
        col[vi3 + 2] = 0.40 + tint * 0.05;
      }
    }

    for (let iz = 0; iz < segs; iz++) {
      for (let ix = 0; ix < segs; ix++) {
        const a = vOff + iz * (segs + 1) + ix;
        const b = a + 1;
        const c = a + (segs + 1);
        const d = c + 1;
        indices[iOff++] = a; indices[iOff++] = c; indices[iOff++] = b;
        indices[iOff++] = b; indices[iOff++] = c; indices[iOff++] = d;
      }
    }

    vOff += (segs + 1) * (segs + 1);
  }

  const surface = new THREE.BufferGeometry();
  surface.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  surface.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  surface.setIndex(new THREE.BufferAttribute(indices, 1));
  surface.computeVertexNormals();
  surface.computeBoundingSphere();

  const gPos = new Float32Array(totalGrains * 3);
  const gCol = new Float32Array(totalGrains * 3);
  let gOff = 0;

  for (let ei = 0; ei < entries.length; ei++) {
    const e = entries[ei];
    const gc = grainList[ei];
    if (!e || gc === undefined) continue;
    const s = e.size;
    const ox = e.position[0], oy = e.position[1] + 0.04, oz = e.position[2];

    for (let i = 0; i < gc; i++) {
      const gi = (gOff + i) * 3;
      const lx = hash01(i * 3.13 + 0.2) * s - s * 0.5;
      const lz = hash01(i * 4.71 + 1.4) * s - s * 0.5;
      const lift = hash01(i * 5.93 + 2.8);
      const tint = hash01(i * 2.37 + 0.9);
      const y = getSandHeight(lx, lz, s) + 0.01 + lift * 0.015;
      gPos[gi] = lx + ox;
      gPos[gi + 1] = y + oy;
      gPos[gi + 2] = lz + oz;
      gCol[gi] = 0.76 + tint * 0.08;
      gCol[gi + 1] = 0.68 + tint * 0.05;
      gCol[gi + 2] = 0.48 + tint * 0.04;
    }
    gOff += gc;
  }

  const grains = new THREE.BufferGeometry();
  grains.setAttribute('position', new THREE.Float32BufferAttribute(gPos, 3));
  grains.setAttribute('color', new THREE.Float32BufferAttribute(gCol, 3));
  grains.computeBoundingSphere();

  const avgSize = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.size, 0) / entries.length
    : 4;

  return [surface, grains, avgSize];
}

export function SandBatch({ entries, toon }: { entries: SandEntry[]; toon?: boolean }) {
  const [surfaceGeo, grainGeo, avgSize] = useMemo(
    () => buildMergedSand(entries),
    [entries],
  );

  const useToon = toon ?? getDefaultToonMode();
  const surfaceMat = getSandSurfaceMaterial(useToon);

  useEffect(() => () => { surfaceGeo.dispose(); grainGeo.dispose(); }, [surfaceGeo, grainGeo]);

  if (entries.length === 0) return null;

  return (
    <>
      <mesh geometry={surfaceGeo} material={surfaceMat} castShadow receiveShadow />
      <points geometry={grainGeo}>
        <pointsMaterial
          size={Math.max(0.02, avgSize * 0.008)}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ============================================================
// Individual Sand (standalone use)
// ============================================================

export default function Sand({ size = 4, toon }: SandProps) {
  const useToon = toon ?? getDefaultToonMode();
  const surfaceMat = getSandSurfaceMaterial(useToon);
  const [surfaceGeometry, grainGeometry] = useMemo(() => {
    const segments = Math.max(20, Math.round(size * 6));
    const surface = new THREE.PlaneGeometry(size, size, segments, segments);
    surface.rotateX(-Math.PI / 2);

    const positions = surface.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getSandHeight(x, z, size);
      const tint = 0.5 + 0.5 * noise2D(x * 0.22 + 5.1, z * 0.22 - 3.6);

      positions.setY(i, y);
      color.setRGB(0.72 + tint * 0.09, 0.61 + tint * 0.07, 0.40 + tint * 0.05);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surface.computeVertexNormals();

    const grainCount = Math.max(90, Math.min(240, Math.round(size * size * 10)));
    const grainPositions = new Float32Array(grainCount * 3);
    const grainColors = new Float32Array(grainCount * 3);

    for (let i = 0; i < grainCount; i++) {
      const x = hash01(i * 3.13 + 0.2) * size - size * 0.5;
      const z = hash01(i * 4.71 + 1.4) * size - size * 0.5;
      const lift = hash01(i * 5.93 + 2.8);
      const tint = hash01(i * 2.37 + 0.9);
      const y = getSandHeight(x, z, size) + 0.01 + lift * 0.015;

      grainPositions[i * 3] = x;
      grainPositions[i * 3 + 1] = y;
      grainPositions[i * 3 + 2] = z;

      color.setRGB(0.76 + tint * 0.08, 0.68 + tint * 0.05, 0.48 + tint * 0.04);
      grainColors[i * 3] = color.r;
      grainColors[i * 3 + 1] = color.g;
      grainColors[i * 3 + 2] = color.b;
    }

    const grains = new THREE.BufferGeometry();
    grains.setAttribute('position', new THREE.Float32BufferAttribute(grainPositions, 3));
    grains.setAttribute('color', new THREE.Float32BufferAttribute(grainColors, 3));

    return [surface, grains];
  }, [size]);

  useEffect(() => {
    return () => {
      surfaceGeometry.dispose();
      grainGeometry.dispose();
    };
  }, [grainGeometry, surfaceGeometry]);

  return (
    <group position={[0, 0.04, 0]}>
      <mesh geometry={surfaceGeometry} material={surfaceMat} castShadow receiveShadow />
      <points geometry={grainGeometry} frustumCulled={false}>
        <pointsMaterial
          size={Math.max(0.02, size * 0.008)}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
