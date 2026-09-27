import { useEffect, useMemo } from 'react';

import * as THREE from 'three';

import { createToonMaterial, getDefaultToonMode } from '@core/rendering/toon';

import { createCellIndex, type CellQuery } from '../../model/cellIndex';
import { worldNoise as noise2D } from '../../terrain/grid';

const disableRaycast = () => undefined;

type SandProps = {
  size?: number;
  toon?: boolean;
  color?: string;
  accentColor?: string;
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

/** Dune height over the tile top at world (x, z): one field across every tile, so neighbors meet without a step. */
function getSandHeight(x: number, z: number): number {
  const duneA = noise2D(x / 6.4, z / 6.4) * 0.07;
  const duneB = noise2D(x / 2.6 + 8.3, z / 3.4 - 5.4) * 0.025;
  const ripple = Math.sin(x * 1.35 + z * 0.42) * 0.01;
  return 0.075 + duneA + duneB + ripple;
}

// ============================================================
// SandBatch -- renders ALL sand tiles with 2 draw calls
// ============================================================

export type SandEntry = {
  position: [number, number, number];
  size: number;
  color?: string;
  accentColor?: string;
};

function sandBounds(entry: SandEntry) {
  const half = entry.size * 0.5;
  return { minX: entry.position[0] - half, maxX: entry.position[0] + half, minZ: entry.position[2] - half, maxZ: entry.position[2] + half };
}

/** Whether another patch at the same height covers the point, so the edge there needs no skirt. */
function hasCoverAt(near: CellQuery<SandEntry>, x: number, z: number, y: number, current: SandEntry): boolean {
  for (const entry of near(x, z)) {
    if (entry === current || Math.abs(entry.position[1] - y) > 0.01) continue;
    const half = entry.size * 0.5;
    if (
      x >= entry.position[0] - half + 0.001 &&
      x <= entry.position[0] + half - 0.001 &&
      z >= entry.position[2] - half + 0.001 &&
      z <= entry.position[2] + half - 0.001
    ) {
      return true;
    }
  }
  return false;
}

function pushSkirtQuad(
  positions: number[],
  colors: number[],
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
  topColor: THREE.Color,
  bottomColor: THREE.Color,
) {
  const push = (vertex: [number, number, number], color: THREE.Color) => {
    positions.push(vertex[0], vertex[1], vertex[2]);
    colors.push(color.r, color.g, color.b);
  };
  push(a, topColor);
  push(b, topColor);
  push(c, bottomColor);
  push(a, topColor);
  push(c, bottomColor);
  push(d, bottomColor);
  push(c, bottomColor);
  push(b, topColor);
  push(a, topColor);
  push(d, bottomColor);
  push(c, bottomColor);
  push(a, topColor);
}

function buildMergedSand(entries: SandEntry[]): [THREE.BufferGeometry, THREE.BufferGeometry, THREE.BufferGeometry, number] {
  let totalVerts = 0, totalIdx = 0, totalGrains = 0;
  const segList: number[] = [];
  const grainList: number[] = [];
  const skirtPositions: number[] = [];
  const skirtColors: number[] = [];

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
  const near = createCellIndex(entries, sandBounds);

  for (let ei = 0; ei < entries.length; ei++) {
    const e = entries[ei];
    const segs = segList[ei];
    if (!e || segs === undefined) continue;
    const s = e.size;
    const ox = e.position[0], oy = e.position[1] + 0.04, oz = e.position[2];
    const baseColor = new THREE.Color(e.color ?? '#b89b66');
    const accentColor = new THREE.Color(e.accentColor ?? '#e0c27a');
    const tmpColor = new THREE.Color();
    const skirtBottomColor = baseColor.clone().multiplyScalar(0.62);
    const skirtBottomY = e.position[1] - 0.12;

    for (let iz = 0; iz <= segs; iz++) {
      for (let ix = 0; ix <= segs; ix++) {
        const vi = vOff + iz * (segs + 1) + ix;
        const lx = (ix / segs - 0.5) * s;
        const lz = (iz / segs - 0.5) * s;
        const y = getSandHeight(lx + ox, lz + oz);
        const tint = 0.5 + 0.5 * noise2D((lx + ox) * 0.22 + 5.1, (lz + oz) * 0.22 - 3.6);
        const vi3 = vi * 3;
        pos[vi3] = lx + ox;
        pos[vi3 + 1] = y + oy;
        pos[vi3 + 2] = lz + oz;
        tmpColor.copy(baseColor).lerp(accentColor, tint * 0.45).multiplyScalar(0.86 + tint * 0.18);
        col[vi3] = tmpColor.r;
        col[vi3 + 1] = tmpColor.g;
        col[vi3 + 2] = tmpColor.b;
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

    const pushEdge = (
      side: 'east' | 'west' | 'north' | 'south',
      x0: number,
      z0: number,
      x1: number,
      z1: number,
    ) => {
      const sampleX = side === 'east' ? s * 0.5 + 0.02 : side === 'west' ? -s * 0.5 - 0.02 : (x0 + x1) * 0.5;
      const sampleZ = side === 'north' ? -s * 0.5 - 0.02 : side === 'south' ? s * 0.5 + 0.02 : (z0 + z1) * 0.5;
      if (hasCoverAt(near, ox + sampleX, oz + sampleZ, e.position[1], e)) return;

      const topA = e.position[1] + 0.04 + getSandHeight(ox + x0, oz + z0);
      const topB = e.position[1] + 0.04 + getSandHeight(ox + x1, oz + z1);
      const tintA = 0.5 + 0.5 * noise2D((ox + x0) * 0.22 + 5.1, (oz + z0) * 0.22 - 3.6);
      const tintB = 0.5 + 0.5 * noise2D((ox + x1) * 0.22 + 5.1, (oz + z1) * 0.22 - 3.6);
      const colorA = baseColor.clone().lerp(accentColor, tintA * 0.45).multiplyScalar(0.86 + tintA * 0.18);
      const colorB = baseColor.clone().lerp(accentColor, tintB * 0.45).multiplyScalar(0.86 + tintB * 0.18);
      const topColor = colorA.clone().lerp(colorB, 0.5);

      pushSkirtQuad(
        skirtPositions,
        skirtColors,
        [ox + x0, topA, oz + z0],
        [ox + x1, topB, oz + z1],
        [ox + x1, skirtBottomY, oz + z1],
        [ox + x0, skirtBottomY, oz + z0],
        topColor,
        skirtBottomColor,
      );
    };

    for (let i = 0; i < segs; i++) {
      const a = (i / segs - 0.5) * s;
      const b = ((i + 1) / segs - 0.5) * s;
      pushEdge('east', s * 0.5, a, s * 0.5, b);
      pushEdge('west', -s * 0.5, b, -s * 0.5, a);
      pushEdge('north', b, -s * 0.5, a, -s * 0.5);
      pushEdge('south', a, s * 0.5, b, s * 0.5);
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
    const baseColor = new THREE.Color(e.color ?? '#b89b66');
    const accentColor = new THREE.Color(e.accentColor ?? '#e0c27a');
    const tmpColor = new THREE.Color();

    // Seeded by the tile's place, so neighboring tiles scatter their grains differently.
    const seed = ox * 0.317 + oz * 0.593;
    for (let i = 0; i < gc; i++) {
      const gi = (gOff + i) * 3;
      const lx = hash01(i * 3.13 + 0.2 + seed) * s - s * 0.5;
      const lz = hash01(i * 4.71 + 1.4 + seed) * s - s * 0.5;
      const lift = hash01(i * 5.93 + 2.8 + seed);
      const tint = hash01(i * 2.37 + 0.9 + seed);
      const y = getSandHeight(lx + ox, lz + oz) + 0.01 + lift * 0.015;
      gPos[gi] = lx + ox;
      gPos[gi + 1] = y + oy;
      gPos[gi + 2] = lz + oz;
      tmpColor.copy(baseColor).lerp(accentColor, tint * 0.55).multiplyScalar(0.92 + tint * 0.12);
      gCol[gi] = tmpColor.r;
      gCol[gi + 1] = tmpColor.g;
      gCol[gi + 2] = tmpColor.b;
    }
    gOff += gc;
  }

  const grains = new THREE.BufferGeometry();
  grains.setAttribute('position', new THREE.Float32BufferAttribute(gPos, 3));
  grains.setAttribute('color', new THREE.Float32BufferAttribute(gCol, 3));
  grains.computeBoundingSphere();

  const skirt = new THREE.BufferGeometry();
  if (skirtPositions.length > 0) {
    skirt.setAttribute('position', new THREE.Float32BufferAttribute(skirtPositions, 3));
    skirt.setAttribute('color', new THREE.Float32BufferAttribute(skirtColors, 3));
    skirt.computeVertexNormals();
    skirt.computeBoundingSphere();
  }

  const avgSize = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.size, 0) / entries.length
    : 4;

  return [surface, grains, skirt, avgSize];
}

export function SandBatch({ entries, toon }: { entries: SandEntry[]; toon?: boolean }) {
  const [surfaceGeo, grainGeo, skirtGeo, avgSize] = useMemo(
    () => buildMergedSand(entries),
    [entries],
  );

  const useToon = toon ?? getDefaultToonMode();
  const surfaceMat = getSandSurfaceMaterial(useToon);

  useEffect(() => () => { surfaceGeo.dispose(); grainGeo.dispose(); skirtGeo.dispose(); }, [surfaceGeo, grainGeo, skirtGeo]);

  if (entries.length === 0) return null;

  return (
    <>
      <mesh name="sand-surface" geometry={surfaceGeo} material={surfaceMat} receiveShadow />
      {skirtGeo.getAttribute('position') && (
        <mesh
          name="sand-skirt"
          geometry={skirtGeo}
          material={surfaceMat}
          receiveShadow
          raycast={disableRaycast}
          userData={{ nonInteractive: true }}
        />
      )}
      <points name="sand-grains" geometry={grainGeo}>
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

export default function Sand({ size = 4, toon, color: sandColor, accentColor: sandAccentColor }: SandProps) {
  const useToon = toon ?? getDefaultToonMode();
  const surfaceMat = getSandSurfaceMaterial(useToon);
  const [surfaceGeometry, grainGeometry] = useMemo(() => {
    const segments = Math.max(20, Math.round(size * 6));
    const surface = new THREE.PlaneGeometry(size, size, segments, segments);
    surface.rotateX(-Math.PI / 2);

    const positions = surface.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();
    const baseColor = new THREE.Color(sandColor ?? '#b89b66');
    const accentColor = new THREE.Color(sandAccentColor ?? '#e0c27a');

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getSandHeight(x, z);
      const tint = 0.5 + 0.5 * noise2D(x * 0.22 + 5.1, z * 0.22 - 3.6);

      positions.setY(i, y);
      color.copy(baseColor).lerp(accentColor, tint * 0.45).multiplyScalar(0.86 + tint * 0.18);
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
      const y = getSandHeight(x, z) + 0.01 + lift * 0.015;

      grainPositions[i * 3] = x;
      grainPositions[i * 3 + 1] = y;
      grainPositions[i * 3 + 2] = z;

      color.copy(baseColor).lerp(accentColor, tint * 0.55).multiplyScalar(0.92 + tint * 0.12);
      grainColors[i * 3] = color.r;
      grainColors[i * 3 + 1] = color.g;
      grainColors[i * 3 + 2] = color.b;
    }

    const grains = new THREE.BufferGeometry();
    grains.setAttribute('position', new THREE.Float32BufferAttribute(grainPositions, 3));
    grains.setAttribute('color', new THREE.Float32BufferAttribute(grainColors, 3));

    return [surface, grains];
  }, [sandAccentColor, sandColor, size]);

  useEffect(() => {
    return () => {
      surfaceGeometry.dispose();
      grainGeometry.dispose();
    };
  }, [grainGeometry, surfaceGeometry]);

  return (
    <group position={[0, 0.04, 0]}>
      <mesh geometry={surfaceGeometry} material={surfaceMat} receiveShadow />
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
