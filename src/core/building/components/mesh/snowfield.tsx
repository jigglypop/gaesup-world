import { useEffect, useMemo } from 'react';

import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

import { createToonMaterial, getDefaultToonMode } from '@core/rendering/toon';

const noise2D = createNoise2D();

type SnowfieldProps = {
  size?: number;
  toon?: boolean;
};

let _snowSurfaceToon: THREE.MeshToonMaterial | null = null;
let _snowSurfacePbr: THREE.MeshPhysicalMaterial | null = null;

function getSnowSurfaceMaterial(toon: boolean): THREE.Material {
  if (toon) {
    if (!_snowSurfaceToon) {
      _snowSurfaceToon = createToonMaterial({
        vertexColors: true,
        steps: 4,
        emissive: '#9ec1e8',
        emissiveIntensity: 0.06,
      });
    }
    return _snowSurfaceToon;
  }
  if (!_snowSurfacePbr) {
    _snowSurfacePbr = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.75,
    });
  }
  return _snowSurfacePbr;
}

function hash01(value: number): number {
  const x = Math.sin(value * 91.7 + 173.3) * 43758.5453123;
  return x - Math.floor(x);
}

function getSnowHeight(x: number, z: number, size: number): number {
  const safeSize = Math.max(size, 1);
  const driftA = Math.exp(-(((x + safeSize * 0.2) * (x + safeSize * 0.2) + (z - safeSize * 0.14) * (z - safeSize * 0.14)) / Math.max(safeSize * safeSize * 0.48, 1))) * 0.12;
  const driftB = Math.exp(-(((x - safeSize * 0.18) * (x - safeSize * 0.18) + (z + safeSize * 0.12) * (z + safeSize * 0.12)) / Math.max(safeSize * safeSize * 0.65, 1))) * 0.08;
  const baseNoise = noise2D(x / (safeSize * 0.7), z / (safeSize * 0.7)) * 0.06;
  const detailNoise = noise2D(x / (safeSize * 0.24) + 6.1, z / (safeSize * 0.24) - 3.7) * 0.018;
  return 0.05 + driftA + driftB + baseNoise + detailNoise;
}

// ============================================================
// SnowfieldBatch -- renders ALL snowfield tiles with 2 draw calls
// ============================================================

export type SnowfieldEntry = {
  position: [number, number, number];
  size: number;
};

function buildMergedSnowfield(entries: SnowfieldEntry[]): [THREE.BufferGeometry, THREE.BufferGeometry, number] {
  let totalVerts = 0, totalIdx = 0, totalSparkles = 0;
  const segList: number[] = [];
  const sparkleList: number[] = [];

  for (const e of entries) {
    const segs = Math.max(22, Math.round(e.size * 7));
    segList.push(segs);
    totalVerts += (segs + 1) * (segs + 1);
    totalIdx += segs * segs * 6;
    const sc = Math.max(28, Math.min(96, Math.round(e.size * e.size * 3)));
    sparkleList.push(sc);
    totalSparkles += sc;
  }

  const pos = new Float32Array(totalVerts * 3);
  const col = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(totalIdx);

  let vOff = 0, iOff = 0;

  for (let ei = 0; ei < entries.length; ei++) {
    const e = entries[ei];
    const segs = segList[ei];
    const s = e.size;
    const ox = e.position[0], oy = e.position[1] + 0.045, oz = e.position[2];

    for (let iz = 0; iz <= segs; iz++) {
      for (let ix = 0; ix <= segs; ix++) {
        const vi = vOff + iz * (segs + 1) + ix;
        const lx = (ix / segs - 0.5) * s;
        const lz = (iz / segs - 0.5) * s;
        const y = getSnowHeight(lx, lz, s);
        const tint = 0.5 + 0.5 * noise2D(lx * 0.16 - 2.4, lz * 0.16 + 7.2);
        const vi3 = vi * 3;
        pos[vi3] = lx + ox;
        pos[vi3 + 1] = y + oy;
        pos[vi3 + 2] = lz + oz;
        col[vi3] = 0.87 + tint * 0.06;
        col[vi3 + 1] = 0.90 + tint * 0.05;
        col[vi3 + 2] = 0.94 + tint * 0.04;
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

  const sPos = new Float32Array(totalSparkles * 3);
  const sCol = new Float32Array(totalSparkles * 3);
  let sOff = 0;

  for (let ei = 0; ei < entries.length; ei++) {
    const e = entries[ei];
    const sc = sparkleList[ei];
    const s = e.size;
    const ox = e.position[0], oy = e.position[1] + 0.045, oz = e.position[2];

    for (let i = 0; i < sc; i++) {
      const gi = (sOff + i) * 3;
      const lx = hash01(i * 2.71 + 0.4) * s - s * 0.5;
      const lz = hash01(i * 3.97 + 1.9) * s - s * 0.5;
      const lift = hash01(i * 5.41 + 2.2);
      const tint = hash01(i * 7.13 + 3.1);
      const y = getSnowHeight(lx, lz, s) + 0.016 + lift * 0.02;
      sPos[gi] = lx + ox;
      sPos[gi + 1] = y + oy;
      sPos[gi + 2] = lz + oz;
      sCol[gi] = 0.9 + tint * 0.08;
      sCol[gi + 1] = 0.94 + tint * 0.05;
      sCol[gi + 2] = 1.0;
    }
    sOff += sc;
  }

  const sparkles = new THREE.BufferGeometry();
  sparkles.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
  sparkles.setAttribute('color', new THREE.Float32BufferAttribute(sCol, 3));
  sparkles.computeBoundingSphere();

  const avgSize = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.size, 0) / entries.length
    : 4;

  return [surface, sparkles, avgSize];
}

export function SnowfieldBatch({ entries, toon }: { entries: SnowfieldEntry[]; toon?: boolean }) {
  const [surfaceGeo, sparkleGeo, avgSize] = useMemo(
    () => buildMergedSnowfield(entries),
    [entries],
  );

  const useToon = toon ?? getDefaultToonMode();
  const surfaceMat = getSnowSurfaceMaterial(useToon);

  useEffect(() => () => { surfaceGeo.dispose(); sparkleGeo.dispose(); }, [surfaceGeo, sparkleGeo]);

  if (entries.length === 0) return null;

  return (
    <>
      <mesh geometry={surfaceGeo} material={surfaceMat} castShadow receiveShadow />
      <points geometry={sparkleGeo}>
        <pointsMaterial
          size={Math.max(0.03, avgSize * 0.01)}
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ============================================================
// Individual Snowfield (standalone use)
// ============================================================

export default function Snowfield({ size = 4, toon }: SnowfieldProps) {
  const useToon = toon ?? getDefaultToonMode();
  const surfaceMat = getSnowSurfaceMaterial(useToon);
  const [surfaceGeometry, sparkleGeometry] = useMemo(() => {
    const segments = Math.max(22, Math.round(size * 7));
    const surface = new THREE.PlaneGeometry(size, size, segments, segments);
    surface.rotateX(-Math.PI / 2);

    const positions = surface.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getSnowHeight(x, z, size);
      const tint = 0.5 + 0.5 * noise2D(x * 0.16 - 2.4, z * 0.16 + 7.2);

      positions.setY(i, y);
      color.setRGB(0.87 + tint * 0.06, 0.90 + tint * 0.05, 0.94 + tint * 0.04);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surface.computeVertexNormals();

    const sparkleCount = Math.max(28, Math.min(96, Math.round(size * size * 3)));
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleColors = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      const x = hash01(i * 2.71 + 0.4) * size - size * 0.5;
      const z = hash01(i * 3.97 + 1.9) * size - size * 0.5;
      const lift = hash01(i * 5.41 + 2.2);
      const tint = hash01(i * 7.13 + 3.1);
      const y = getSnowHeight(x, z, size) + 0.016 + lift * 0.02;

      sparklePositions[i * 3] = x;
      sparklePositions[i * 3 + 1] = y;
      sparklePositions[i * 3 + 2] = z;

      color.setRGB(0.9 + tint * 0.08, 0.94 + tint * 0.05, 1.0);
      sparkleColors[i * 3] = color.r;
      sparkleColors[i * 3 + 1] = color.g;
      sparkleColors[i * 3 + 2] = color.b;
    }

    const sparkles = new THREE.BufferGeometry();
    sparkles.setAttribute('position', new THREE.Float32BufferAttribute(sparklePositions, 3));
    sparkles.setAttribute('color', new THREE.Float32BufferAttribute(sparkleColors, 3));

    return [surface, sparkles];
  }, [size]);

  useEffect(() => {
    return () => {
      surfaceGeometry.dispose();
      sparkleGeometry.dispose();
    };
  }, [sparkleGeometry, surfaceGeometry]);

  return (
    <group position={[0, 0.045, 0]}>
      <mesh geometry={surfaceGeometry} material={surfaceMat} castShadow receiveShadow />
      <points geometry={sparkleGeometry} frustumCulled={false}>
        <pointsMaterial
          size={Math.max(0.03, size * 0.01)}
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
