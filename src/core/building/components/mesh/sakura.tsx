import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { createToonMaterial, getDefaultToonMode } from '@core/rendering/toon';
import { useWeatherStore } from '@core/weather/stores/weatherStore';

import type { BuildingTreeKind } from '../../types';

type SakuraProps = { size?: number; toon?: boolean };

type BranchSpec = {
  pivotY: number; length: number; radius: number;
  yaw: number; bend: number; lean: number;
  twigLength: number; twigYaw: number; twigLean: number;
};

type ClusterSpec = {
  position: [number, number, number];
  rotation: [number, number, number];
  outerScale: [number, number, number];
  innerScale: [number, number, number];
};

type RootSpec = { angle: number; length: number; radius: number; spread: number };
type TreeCanopyShape = 'round' | 'oval' | 'conifer' | 'column' | 'weeping' | 'sparse';

function hash01(v: number): number {
  const x = Math.sin(v * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function setColor(buf: Float32Array, i: number, c: THREE.Color) {
  buf[i] = c.r; buf[i + 1] = c.g; buf[i + 2] = c.b;
}

// --- Shared GPU resources (singleton across all Sakura instances) ---

let _sharedGeo: {
  limb: THREE.CylinderGeometry; canopyCluster: THREE.IcosahedronGeometry;
  canopyCore: THREE.SphereGeometry; trunkTop: THREE.SphereGeometry;
} | null = null;

type SakuraMatSet = {
  bark: THREE.Material; barkDark: THREE.Material;
  blossomShell: THREE.Material; blossomCore: THREE.Material;
};

let _sharedMatPbr: SakuraMatSet | null = null;
let _sharedMatToon: SakuraMatSet | null = null;

function getSharedGeometry() {
  if (!_sharedGeo) {
    _sharedGeo = {
      limb: new THREE.CylinderGeometry(0.5, 1, 1, 8, 1, false),
      canopyCluster: new THREE.IcosahedronGeometry(1, 1),
      canopyCore: new THREE.SphereGeometry(1, 10, 8),
      trunkTop: new THREE.SphereGeometry(1, 10, 8),
    };
  }
  return _sharedGeo;
}

function getSharedMaterials(toon: boolean): SakuraMatSet {
  if (toon) {
    if (!_sharedMatToon) {
      _sharedMatToon = {
        bark: createToonMaterial({ color: '#5e3d30', steps: 3 }),
        barkDark: createToonMaterial({ color: '#3f271e', steps: 3 }),
        blossomShell: createToonMaterial({ color: '#f7bfd2', transparent: true, opacity: 0.78, steps: 4, depthWrite: false }),
        blossomCore: createToonMaterial({ color: '#ffe6f0', transparent: true, opacity: 0.6, steps: 4, depthWrite: false }),
      };
    }
    return _sharedMatToon;
  }
  if (!_sharedMatPbr) {
    _sharedMatPbr = {
      bark: new THREE.MeshStandardMaterial({ color: '#5e3d30', roughness: 0.95, metalness: 0.02 }),
      barkDark: new THREE.MeshStandardMaterial({ color: '#3f271e', roughness: 1, metalness: 0.01 }),
      blossomShell: new THREE.MeshStandardMaterial({ color: '#f7bfd2', roughness: 0.92, metalness: 0.0, transparent: true, opacity: 0.68 }),
      blossomCore: new THREE.MeshStandardMaterial({ color: '#ffe6f0', roughness: 0.84, metalness: 0.0, transparent: true, opacity: 0.5 }),
    };
  }
  return _sharedMatPbr;
}

// --- Tree structure generators ---

function createBranches(scale: number, trunkHeight: number, shape: TreeCanopyShape): BranchSpec[] {
  const countBias = shape === 'sparse' ? 5 : 0;
  const n = Math.max(8, Math.min(20, Math.round(10 + scale * 4 + countBias)));
  return Array.from({ length: n }, (_, i) => {
    const s = 19.3 + i * 13.17 + scale * 5.1;
    const conifer = shape === 'conifer' || shape === 'column';
    const sparse = shape === 'sparse';
    const lenMul = conifer ? 0.58 : sparse ? 1.24 : shape === 'weeping' ? 0.82 : 1;
    const len = (1.05 + hash01(s + 1) * 1.35) * scale * lenMul;
    const dir = hash01(s + 2) > 0.5 ? 1 : -1;
    return {
      pivotY: trunkHeight * (conifer ? 0.28 + hash01(s + 3) * 0.52 : 0.38 + hash01(s + 3) * 0.42),
      length: len,
      radius: (0.08 + hash01(s + 4) * 0.045) * scale * (sparse ? 0.82 : 1),
      yaw: hash01(s + 5) * Math.PI * 2,
      bend: (conifer ? 0.38 : 0.58 + hash01(s + 6) * 0.34) * dir,
      lean: (hash01(s + 7) - 0.5) * (conifer ? 0.18 : 0.34),
      twigLength: len * (sparse ? 0.5 : 0.34 + hash01(s + 8) * 0.26),
      twigYaw: (hash01(s + 9) - 0.5) * (conifer ? 0.48 : 0.95),
      twigLean: (shape === 'weeping' ? -0.55 : 0.25 + hash01(s + 10) * 0.38) * -dir,
    };
  });
}

function createRoots(scale: number): RootSpec[] {
  return Array.from({ length: 5 }, (_, i) => {
    const s = 101.2 + i * 8.31 + scale * 3.7;
    return {
      angle: (i / 5) * Math.PI * 2 + (hash01(s) - 0.5) * 0.4,
      length: (0.52 + hash01(s + 1) * 0.42) * scale,
      radius: (0.09 + hash01(s + 2) * 0.04) * scale,
      spread: (0.8 + hash01(s + 3) * 0.28) * (hash01(s + 4) > 0.5 ? 1 : -1),
    };
  });
}

function createClusters(scale: number, th: number, cr: number, ch: number, shape: TreeCanopyShape): ClusterSpec[] {
  const n = Math.max(6, Math.min(18, Math.round((shape === 'sparse' ? 6 : 9) + scale * 4)));
  return Array.from({ length: n }, (_, i) => {
    const s = 220.4 + i * 10.73 + scale * 4.4;
    const a = hash01(s) * Math.PI * 2;
    const tier = n <= 1 ? 0 : i / (n - 1);
    const pointTaper = Math.max(0.12, 1 - tier);
    const conifer = shape === 'conifer' || shape === 'column';
    const rad = conifer
      ? cr * pointTaper * (shape === 'column' ? 0.34 : 0.58) * (0.55 + hash01(s + 1) * 0.45)
      : cr * (0.18 + hash01(s + 1) * 0.72);
    const ox = (0.7 + hash01(s + 5) * 0.9) * scale * (conifer ? pointTaper : 1);
    const oy = (0.52 + hash01(s + 6) * 0.56) * scale * (shape === 'weeping' ? 1.4 : 1);
    const oz = (0.66 + hash01(s + 7) * 0.88) * scale * (conifer ? pointTaper : 1);
    const y = conifer
      ? th * 0.42 + ch * (0.06 + tier * 0.9)
      : shape === 'weeping'
        ? th * (0.46 + hash01(s + 3) * 0.18) + hash01(s + 4) * ch * 0.32
        : th * (0.64 + hash01(s + 3) * 0.22) + hash01(s + 4) * ch * 0.42;
    return {
      position: [Math.cos(a) * rad, y, Math.sin(a) * rad * (0.86 + hash01(s + 2) * 0.22)],
      rotation: [(hash01(s + 8) - 0.5) * 0.55, hash01(s + 9) * Math.PI * 2, (hash01(s + 10) - 0.5) * 0.55],
      outerScale: [
        shape === 'column' ? ox * 0.62 : ox,
        conifer ? oy * 0.88 : oy,
        shape === 'column' ? oz * 0.62 : oz,
      ],
      innerScale: [ox * 0.7, oy * 0.72, oz * 0.7],
    };
  });
}

// --- Matrix composition helpers ---

const _grp = new THREE.Object3D();
const _obj = new THREE.Object3D();
const _composed = new THREE.Matrix4();
const _treeXlat = new THREE.Matrix4();
const _tmpCol = new THREE.Color();

function composeInstance(
  mesh: THREE.InstancedMesh, idx: number,
  tp: [number, number, number] | null,
  gp: [number, number, number], gr: [number, number, number],
  cp: [number, number, number], cr: [number, number, number] | null,
  cs: [number, number, number],
) {
  _grp.position.set(gp[0], gp[1], gp[2]);
  _grp.rotation.set(gr[0], gr[1], gr[2]);
  _grp.updateMatrix();
  _obj.position.set(cp[0], cp[1], cp[2]);
  _obj.rotation.set(cr ? cr[0] : 0, cr ? cr[1] : 0, cr ? cr[2] : 0);
  _obj.scale.set(cs[0], cs[1], cs[2]);
  _obj.updateMatrix();
  _composed.multiplyMatrices(_grp.matrix, _obj.matrix);
  if (tp) {
    _treeXlat.makeTranslation(tp[0], tp[1] + 0.02, tp[2]);
    _composed.premultiply(_treeXlat);
  }
  mesh.setMatrixAt(idx, _composed);
}

function composeSimple(
  mesh: THREE.InstancedMesh, idx: number,
  tp: [number, number, number] | null,
  p: [number, number, number], r: [number, number, number], s: [number, number, number],
) {
  _obj.position.set(p[0], p[1], p[2]);
  _obj.rotation.set(r[0], r[1], r[2]);
  _obj.scale.set(s[0], s[1], s[2]);
  _obj.updateMatrix();
  if (tp) {
    _treeXlat.makeTranslation(tp[0], tp[1] + 0.02, tp[2]);
    _composed.multiplyMatrices(_treeXlat, _obj.matrix);
    mesh.setMatrixAt(idx, _composed);
  } else {
    mesh.setMatrixAt(idx, _obj.matrix);
  }
}

// --- Petal fill helpers (shared between individual & batch) ---

function fillCanopy(
  pos: Float32Array, col: Float32Array, start: number, count: number,
  th: number, cr: number, ch: number, ox: number, oy: number, oz: number,
  shape: TreeCanopyShape = 'round',
  tint?: THREE.Color,
) {
  const a = tint ? tint.clone().multiplyScalar(0.85) : new THREE.Color('#f3a1bf');
  const b = tint ? tint.clone().lerp(new THREE.Color('#ffffff'), 0.6) : new THREE.Color('#fff1f6');
  const t = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const s = 330.7 + i * 17.13;
    const ang = hash01(s) * Math.PI * 2;
    const heightT = Math.pow(hash01(s + 4), shape === 'conifer' || shape === 'column' ? 0.92 : 0.72);
    const taper = shape === 'conifer'
      ? Math.max(0.08, 1 - heightT * 0.92)
      : shape === 'column'
        ? 0.32 + Math.max(0.08, 1 - heightT) * 0.24
        : shape === 'weeping'
          ? 0.82 + heightT * 0.28
          : 1;
    const ring = cr * taper * (0.18 + Math.sqrt(hash01(s + 1)) * 0.86);
    const idx = (start + i) * 3;
    pos[idx] = Math.cos(ang) * ring * (0.82 + hash01(s + 2) * 0.22) + ox;
    pos[idx + 1] = th * (shape === 'weeping' ? 0.46 : 0.58) + heightT * ch + (hash01(s + 5) - 0.5) * 0.36 + oy;
    pos[idx + 2] = Math.sin(ang) * ring * (0.8 + hash01(s + 3) * 0.26) + oz;
    t.copy(a).lerp(b, 0.28 + hash01(s + 6) * 0.72).multiplyScalar(0.92 + hash01(s + 7) * 0.18);
    setColor(col, idx, t);
  }
}

function fillGround(
  pos: Float32Array, col: Float32Array, start: number, count: number,
  cr: number, ox: number, oy: number, oz: number,
  tint?: THREE.Color,
) {
  const a = tint ? tint.clone().multiplyScalar(0.9) : new THREE.Color('#f7cadb');
  const b = tint ? tint.clone().lerp(new THREE.Color('#ffffff'), 0.7) : new THREE.Color('#fff3f8');
  const t = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const s = 510.9 + i * 9.41;
    const ang = hash01(s) * Math.PI * 2;
    const dist = cr * (0.18 + Math.pow(hash01(s + 1), 0.6) * 0.92);
    const idx = (start + i) * 3;
    pos[idx] = Math.cos(ang) * dist + ox;
    pos[idx + 1] = 0.035 + hash01(s + 2) * 0.03 + oy;
    pos[idx + 2] = Math.sin(ang) * dist + oz;
    t.copy(a).lerp(b, 0.35 + hash01(s + 3) * 0.65).multiplyScalar(0.9 + hash01(s + 4) * 0.12);
    setColor(col, idx, t);
  }
}

function fillFalling(
  pos: Float32Array, col: Float32Array, p1: Float32Array, p2: Float32Array,
  treePos: Float32Array | null, pScale: Float32Array | null,
  start: number, count: number,
  th: number, cr: number, ch: number, scale: number,
  ox: number, oy: number, oz: number,
  tint?: THREE.Color,
) {
  const a = tint ? tint.clone().multiplyScalar(0.88) : new THREE.Color('#f8b3ca');
  const b = tint ? tint.clone().lerp(new THREE.Color('#ffffff'), 0.65) : new THREE.Color('#fff5fa');
  const t = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const s = 740.6 + i * 6.83;
    const ang = hash01(s) * Math.PI * 2;
    const ring = cr * (0.1 + hash01(s + 1) * 0.72);
    const gi = start + i;
    const idx3 = gi * 3;
    pos[idx3] = Math.cos(ang) * ring;
    pos[idx3 + 1] = th * 0.66 + hash01(s + 2) * ch * 0.88;
    pos[idx3 + 2] = Math.sin(ang) * ring;
    const idx4 = gi * 4;
    p1[idx4] = 0.12 + hash01(s + 3) * 0.18;
    p1[idx4 + 1] = hash01(s + 4);
    p1[idx4 + 2] = 0.08 + hash01(s + 5) * 0.18;
    p1[idx4 + 3] = 1.0 + hash01(s + 6) * 1.9;
    const idx2 = gi * 2;
    p2[idx2] = (hash01(s + 7) - 0.5) * 0.8;
    p2[idx2 + 1] = (hash01(s + 8) - 0.5) * 0.8;
    if (treePos) { treePos[idx3] = ox; treePos[idx3 + 1] = oy; treePos[idx3 + 2] = oz; }
    if (pScale) { pScale[gi] = 0.11 * scale; }
    t.copy(a).lerp(b, 0.2 + hash01(s + 9) * 0.8).multiplyScalar(0.94 + hash01(s + 10) * 0.12);
    setColor(col, idx3, t);
  }
}

function makePointsGeo(pos: Float32Array, col: Float32Array, computeBBox = false): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  if (computeBBox) g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

// ============================================================
// SakuraBatch -- renders ALL sakura trees with 8 draw calls
// CE S(D)=e^{-D}: fold N*50 individual draw calls into 8
// ============================================================

export type SakuraTreeEntry = {
  position: [number, number, number];
  size: number;
  treeKind?: BuildingTreeKind;
  blossomColor?: string;
  barkColor?: string;
};

type TreeSpec = {
  pos: [number, number, number];
  scale: number; trunkHeight: number; crownRadius: number; crownHeight: number;
  shape: TreeCanopyShape;
  branches: BranchSpec[]; roots: RootSpec[]; clusters: ClusterSpec[];
  canopyN: number; groundN: number; fallingN: number;
  blossom: THREE.Color;
  bark: THREE.Color;
};

const _defaultBlossom = new THREE.Color('#f7bfd2');
const _defaultBark = new THREE.Color('#5e3d30');
const _white = new THREE.Color('#ffffff');

const TREE_PRESETS: Record<BuildingTreeKind, {
  canopyColor: string;
  bark: string;
  shape: TreeCanopyShape;
  crownRadius: number;
  crownHeight: number;
  trunkHeight: number;
  canopyDensity: number;
  falling: number;
  ground: number;
}> = {
  sakura: { canopyColor: '#f7bfd2', bark: '#5e3d30', shape: 'round', crownRadius: 1.0, crownHeight: 1.0, trunkHeight: 1.0, canopyDensity: 1.0, falling: 1.0, ground: 1.0 },
  oak: { canopyColor: '#4f8f3a', bark: '#6b4a2a', shape: 'round', crownRadius: 1.12, crownHeight: 0.86, trunkHeight: 1.0, canopyDensity: 1.0, falling: 0.08, ground: 0.35 },
  pine: { canopyColor: '#2f6f45', bark: '#5b3b24', shape: 'conifer', crownRadius: 0.92, crownHeight: 1.5, trunkHeight: 1.18, canopyDensity: 0.82, falling: 0.02, ground: 0.12 },
  maple: { canopyColor: '#d05a2d', bark: '#654126', shape: 'oval', crownRadius: 1.02, crownHeight: 0.78, trunkHeight: 0.96, canopyDensity: 1.0, falling: 0.45, ground: 0.8 },
  birch: { canopyColor: '#87b95a', bark: '#e8e1cf', shape: 'oval', crownRadius: 0.82, crownHeight: 1.08, trunkHeight: 1.14, canopyDensity: 0.86, falling: 0.12, ground: 0.35 },
  willow: { canopyColor: '#7fae55', bark: '#6a5635', shape: 'weeping', crownRadius: 1.2, crownHeight: 1.28, trunkHeight: 0.88, canopyDensity: 1.08, falling: 0.2, ground: 0.45 },
  cypress: { canopyColor: '#315f3a', bark: '#59402d', shape: 'column', crownRadius: 0.78, crownHeight: 1.65, trunkHeight: 1.24, canopyDensity: 0.74, falling: 0.02, ground: 0.12 },
  dead: { canopyColor: '#8b7a61', bark: '#4b392c', shape: 'sparse', crownRadius: 0.7, crownHeight: 0.7, trunkHeight: 1.08, canopyDensity: 0.2, falling: 0.0, ground: 0.12 },
};

function computeSpecs(trees: SakuraTreeEntry[]): TreeSpec[] {
  return trees.map(t => {
    const preset = TREE_PRESETS[t.treeKind ?? 'sakura'];
    const s = THREE.MathUtils.clamp(t.size / 4, 0.95, 1.85);
    const th = 3.8 * s * preset.trunkHeight;
    const cr = (1.65 * s + Math.min(t.size * 0.08, 0.55)) * preset.crownRadius;
    const ch = (2.15 * s + Math.min(t.size * 0.04, 0.35)) * preset.crownHeight;
    return {
      pos: t.position, scale: s, trunkHeight: th, crownRadius: cr, crownHeight: ch,
      shape: preset.shape,
      branches: createBranches(s, th, preset.shape), roots: createRoots(s),
      clusters: createClusters(s, th, cr, ch, preset.shape),
      canopyN: Math.round(Math.max(180, Math.min(420, Math.round(210 + s * 95))) * preset.canopyDensity),
      groundN: Math.round(Math.max(44, Math.min(120, Math.round(54 + s * 26))) * preset.ground),
      fallingN: Math.round(Math.max(52, Math.min(132, Math.round(62 + s * 30))) * preset.falling),
      blossom: t.blossomColor ? new THREE.Color(t.blossomColor) : new THREE.Color(preset.canopyColor),
      bark: t.barkColor ? new THREE.Color(t.barkColor) : new THREE.Color(preset.bark),
    };
  });
}

const BATCH_FALLING_VERT = /* glsl */ `
attribute vec3 color;
attribute vec4 aParams1;
attribute vec2 aParams2;
attribute vec3 aTreePos;
attribute float aPointScale;

uniform float uTime;
uniform float uScale;
uniform float uWind;

varying vec3 vColor;

void main() {
  float cycle = fract(uTime * aParams1.x + aParams1.y);
  float drift = 1.0 - pow(cycle, 1.22);
  float w = uTime * aParams1.w + aParams1.y * 6.28318;

  vec3 localPos = vec3(
    position.x + sin(w) * aParams1.z * uWind + aParams2.x * cycle * uWind,
    0.18 + position.y * drift + sin(w * 0.6) * 0.06,
    position.z + cos(w * 0.82) * aParams1.z * 0.72 * uWind + aParams2.y * cycle * uWind
  );

  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(localPos + aTreePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aPointScale * (uScale / -mvPosition.z);
}
`;

const BATCH_FALLING_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  gl_FragColor = vec4(vColor, uOpacity * exp(-r2 * 8.0));
}
`;

export function SakuraBatch({ trees, toon }: { trees: SakuraTreeEntry[]; toon?: boolean }) {
  const barkRef = useRef<THREE.InstancedMesh>(null!);
  const darkRef = useRef<THREE.InstancedMesh>(null!);
  const topRef = useRef<THREE.InstancedMesh>(null!);
  const shellRef = useRef<THREE.InstancedMesh>(null!);
  const coreRef = useRef<THREE.InstancedMesh>(null!);
  const fallingRef = useRef<THREE.Points>(null!);

  const useToon = toon ?? getDefaultToonMode();
  const geo = getSharedGeometry();
  const mat = getSharedMaterials(useToon);
  const specs = useMemo(() => computeSpecs(trees), [trees]);

  const counts = useMemo(() => {
    let bark = 0, dark = 0, cluster = 0, canopy = 0, ground = 0, falling = 0;
    for (const s of specs) {
      bark += s.branches.length + 1;
      dark += s.roots.length + s.branches.length;
      cluster += s.clusters.length;
      canopy += s.canopyN;
      ground += s.groundN;
      falling += s.fallingN;
    }
    return { bark, dark, top: specs.length, cluster, canopy, ground, falling };
  }, [specs]);

  const avgScale = useMemo(() => {
    if (specs.length === 0) return 1;
    return specs.reduce((sum, s) => sum + s.scale, 0) / specs.length;
  }, [specs]);

  const hasCustomColor = useMemo(
    () => specs.some(s => s.blossom !== _defaultBlossom || s.bark !== _defaultBark),
    [specs],
  );

  const canopyGeo = useMemo(() => {
    const p = new Float32Array(counts.canopy * 3), c = new Float32Array(counts.canopy * 3);
    let off = 0;
    for (const s of specs) {
      const tint = s.blossom !== _defaultBlossom ? s.blossom : undefined;
      fillCanopy(p, c, off, s.canopyN, s.trunkHeight, s.crownRadius, s.crownHeight, s.pos[0], s.pos[1] + 0.02, s.pos[2], s.shape, tint);
      off += s.canopyN;
    }
    return makePointsGeo(p, c);
  }, [specs, counts.canopy]);

  const groundGeo = useMemo(() => {
    const p = new Float32Array(counts.ground * 3), c = new Float32Array(counts.ground * 3);
    let off = 0;
    for (const s of specs) {
      const tint = s.blossom !== _defaultBlossom ? s.blossom : undefined;
      fillGround(p, c, off, s.groundN, s.crownRadius, s.pos[0], s.pos[1] + 0.02, s.pos[2], tint);
      off += s.groundN;
    }
    return makePointsGeo(p, c);
  }, [specs, counts.ground]);

  const fallingGeo = useMemo(() => {
    const n = counts.falling;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const p1 = new Float32Array(n * 4), p2 = new Float32Array(n * 2);
    const tp = new Float32Array(n * 3), ps = new Float32Array(n);
    let off = 0;
    for (const s of specs) {
      const tint = s.blossom !== _defaultBlossom ? s.blossom : undefined;
      fillFalling(pos, col, p1, p2, tp, ps, off, s.fallingN,
        s.trunkHeight, s.crownRadius, s.crownHeight, s.scale,
        s.pos[0], s.pos[1] + 0.02, s.pos[2], tint);
      off += s.fallingN;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aParams1', new THREE.Float32BufferAttribute(p1, 4));
    g.setAttribute('aParams2', new THREE.Float32BufferAttribute(p2, 2));
    g.setAttribute('aTreePos', new THREE.Float32BufferAttribute(tp, 3));
    g.setAttribute('aPointScale', new THREE.Float32BufferAttribute(ps, 1));
    g.computeBoundingSphere();
    return g;
  }, [specs, counts.falling]);

  const fallingMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 1 },
      uOpacity: { value: 0.88 },
      uWind: { value: 1 },
    },
    vertexShader: BATCH_FALLING_VERT,
    fragmentShader: BATCH_FALLING_FRAG,
    transparent: true, depthWrite: false,
  }), []);

  useLayoutEffect(() => {
    let bi = 0, di = 0, ti = 0, si = 0, ci = 0;

    // setColorAt 은 instanceColor 가 없으면 자동 생성하고, 있으면 in-place 로 갱신한다.
    // 매 spec 변경마다 새 InstancedBufferAttribute 를 만들어 GPU 버퍼를 dispose 없이 교체하던
    // 이전 구현은 WebGL 리소스 누수를 일으켰다.
    for (const s of specs) {
      const tp = s.pos;
      const barkTint = s.bark !== _defaultBark;
      const blossomTint = s.blossom !== _defaultBlossom;

      composeInstance(barkRef.current, bi, tp,
        [0, s.trunkHeight * 0.5, 0], [0.02, 0, -0.04],
        [0, 0, 0], null, [0.3 * s.scale, s.trunkHeight, 0.3 * s.scale]);
      if (hasCustomColor) {
        barkRef.current.setColorAt(bi, barkTint ? s.bark : _defaultBark);
      }
      bi++;

      composeInstance(topRef.current, ti, tp,
        [0, s.trunkHeight * 0.5, 0], [0.02, 0, -0.04],
        [0, s.trunkHeight * 0.48, 0], null, [0.24 * s.scale, 0.32 * s.scale, 0.24 * s.scale]);
      if (hasCustomColor) {
        const tc = barkTint ? _tmpCol.copy(s.bark).multiplyScalar(0.65) : _tmpCol.set('#3f271e');
        topRef.current.setColorAt(ti, tc);
      }
      ti++;

      for (const b of s.branches) {
        composeInstance(barkRef.current, bi, tp,
          [0, b.pivotY, 0], [b.lean, b.yaw, b.bend],
          [0, b.length * 0.5, 0], null, [b.radius, b.length, b.radius]);
        if (hasCustomColor) {
          barkRef.current.setColorAt(bi, barkTint ? s.bark : _defaultBark);
        }
        bi++;
      }

      for (const r of s.roots) {
        composeInstance(darkRef.current, di, tp,
          [0, 0.14 * s.scale, 0], [0, r.angle, r.spread],
          [0, r.length * 0.22, 0], null, [r.radius, r.length, r.radius]);
        if (hasCustomColor) {
          const dc = barkTint ? _tmpCol.copy(s.bark).multiplyScalar(0.65) : _tmpCol.set('#3f271e');
          darkRef.current.setColorAt(di, dc);
        }
        di++;
      }
      for (const b of s.branches) {
        composeInstance(darkRef.current, di, tp,
          [0, b.pivotY, 0], [b.lean, b.yaw, b.bend],
          [0, b.length * 0.76, 0], [b.twigLean, b.twigYaw, b.bend * -0.42],
          [b.radius * 0.52, b.twigLength, b.radius * 0.52]);
        if (hasCustomColor) {
          const dc = barkTint ? _tmpCol.copy(s.bark).multiplyScalar(0.65) : _tmpCol.set('#3f271e');
          darkRef.current.setColorAt(di, dc);
        }
        di++;
      }

      for (const c of s.clusters) {
        composeSimple(shellRef.current, si, tp, c.position, c.rotation, c.outerScale);
        if (hasCustomColor) {
          shellRef.current.setColorAt(si, blossomTint ? s.blossom : _defaultBlossom);
        }
        si++;
        composeSimple(coreRef.current, ci, tp, c.position, c.rotation, c.innerScale);
        if (hasCustomColor) {
          const cc = blossomTint
            ? _tmpCol.copy(s.blossom).lerp(_white, 0.4)
            : _tmpCol.set('#ffe6f0');
          coreRef.current.setColorAt(ci, cc);
        }
        ci++;
      }
    }

    for (const [ref, count] of [[barkRef, bi], [darkRef, di], [topRef, ti], [shellRef, si], [coreRef, ci]] as const) {
      ref.current.count = count as number;
      ref.current.instanceMatrix.needsUpdate = true;
      if (hasCustomColor && ref.current.instanceColor) {
        ref.current.instanceColor.needsUpdate = true;
      }
    }
  }, [specs, hasCustomColor, counts]);

  useEffect(() => () => {
    canopyGeo.dispose(); groundGeo.dispose();
    fallingGeo.dispose(); fallingMat.dispose();
  }, [canopyGeo, groundGeo, fallingGeo, fallingMat]);

  useFrame((state) => {
    const points = fallingRef.current;
    if (!points) return;
    const parent = points.parent;
    if (parent && !parent.visible) return;
    const m = points.material as THREE.ShaderMaterial | undefined;
    if (m?.uniforms) {
      const uTime = m.uniforms['uTime'];
      const uScale = m.uniforms['uScale'];
      const w = useWeatherStore.getState().current;
      const intensity = w?.intensity ?? 0;
      const base =
        w?.kind === 'storm' ? 2.4 :
        w?.kind === 'rain'  ? 1.6 :
        w?.kind === 'snow'  ? 1.2 :
        w?.kind === 'cloudy'? 1.1 :
                              0.9;
      const uWind = m.uniforms['uWind'];
      if (uTime) uTime.value = state.clock.getElapsedTime();
      if (uScale) uScale.value = state.gl.domElement.height * 0.5;
      if (uWind) uWind.value = base + intensity * 0.7;
    }
  });

  if (specs.length === 0) return null;

  return (
    <>
      <instancedMesh ref={barkRef} args={[geo.limb, mat.bark, counts.bark]} castShadow />
      <instancedMesh ref={darkRef} args={[geo.limb, mat.barkDark, counts.dark]} />
      <instancedMesh ref={topRef} args={[geo.trunkTop, mat.barkDark, counts.top]} castShadow />
      <instancedMesh ref={shellRef} args={[geo.canopyCluster, mat.blossomShell, counts.cluster]} castShadow />
      <instancedMesh ref={coreRef} args={[geo.canopyCore, mat.blossomCore, counts.cluster]} />
      <points geometry={canopyGeo}>
        <pointsMaterial size={0.08 * avgScale} sizeAttenuation vertexColors transparent opacity={0.82} depthWrite={false} />
      </points>
      <points ref={fallingRef} geometry={fallingGeo} material={fallingMat} frustumCulled={false} />
      <points geometry={groundGeo}>
        <pointsMaterial size={0.085 * avgScale} sizeAttenuation vertexColors transparent opacity={0.7} depthWrite={false} />
      </points>
    </>
  );
}

// ============================================================
// Individual Sakura (standalone use outside TileSystem)
// ============================================================

export default function Sakura({ size = 4, toon }: SakuraProps) {
  const crownRef = useRef<THREE.Group | null>(null);
  const fallingRef = useRef<THREE.Points>(null!);
  const barkLimbRef = useRef<THREE.InstancedMesh>(null!);
  const darkLimbRef = useRef<THREE.InstancedMesh>(null!);
  const shellRef = useRef<THREE.InstancedMesh>(null!);
  const coreRef = useRef<THREE.InstancedMesh>(null!);

  const scale = useMemo(() => THREE.MathUtils.clamp(size / 4, 0.95, 1.85), [size]);
  const th = 3.8 * scale;
  const cr = 1.65 * scale + Math.min(size * 0.08, 0.55);
  const ch = 2.15 * scale + Math.min(size * 0.04, 0.35);

  const useToon = toon ?? getDefaultToonMode();
  const geo = getSharedGeometry();
  const mat = getSharedMaterials(useToon);

  const branches = useMemo(() => createBranches(scale, th, 'round'), [scale, th]);
  const roots = useMemo(() => createRoots(scale), [scale]);
  const clusters = useMemo(() => createClusters(scale, th, cr, ch, 'round'), [scale, th, cr, ch]);

  const barkN = branches.length;
  const darkN = roots.length + branches.length;
  const clusterN = clusters.length;
  const canopyN = Math.max(180, Math.min(420, Math.round(210 + scale * 95)));
  const groundN = Math.max(44, Math.min(120, Math.round(54 + scale * 26)));
  const fallingN = Math.max(52, Math.min(132, Math.round(62 + scale * 30)));

  const canopyGeo = useMemo(() => {
    const p = new Float32Array(canopyN * 3), c = new Float32Array(canopyN * 3);
    fillCanopy(p, c, 0, canopyN, th, cr, ch, 0, 0, 0);
    return makePointsGeo(p, c, true);
  }, [canopyN, th, cr, ch]);

  const groundGeo = useMemo(() => {
    const p = new Float32Array(groundN * 3), c = new Float32Array(groundN * 3);
    fillGround(p, c, 0, groundN, cr, 0, 0, 0);
    return makePointsGeo(p, c, true);
  }, [groundN, cr]);

  const fallingGeo = useMemo(() => {
    const pos = new Float32Array(fallingN * 3), col = new Float32Array(fallingN * 3);
    const p1 = new Float32Array(fallingN * 4), p2 = new Float32Array(fallingN * 2);
    fillFalling(pos, col, p1, p2, null, null, 0, fallingN, th, cr, ch, scale, 0, 0, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aParams1', new THREE.Float32BufferAttribute(p1, 4));
    g.setAttribute('aParams2', new THREE.Float32BufferAttribute(p2, 2));
    g.computeBoundingSphere();
    return g;
  }, [fallingN, th, cr, ch, scale]);

  const fallingMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPointSize: { value: 0.11 * scale }, uScale: { value: 1 }, uOpacity: { value: 0.88 } },
    vertexShader: SOLO_FALLING_VERT, fragmentShader: BATCH_FALLING_FRAG,
    transparent: true, depthWrite: false,
  }), [scale]);

  useLayoutEffect(() => {
    const bm = barkLimbRef.current;
    if (bm) {
      bm.count = barkN;
      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        if (!b) continue;
        composeInstance(bm, i, null, [0, b.pivotY, 0], [b.lean, b.yaw, b.bend], [0, b.length * 0.5, 0], null, [b.radius, b.length, b.radius]);
      }
      bm.instanceMatrix.needsUpdate = true;
    }
    const dm = darkLimbRef.current;
    if (dm) {
      dm.count = darkN;
      let idx = 0;
      for (const r of roots) composeInstance(dm, idx++, null, [0, 0.14 * scale, 0], [0, r.angle, r.spread], [0, r.length * 0.22, 0], null, [r.radius, r.length, r.radius]);
      for (const b of branches) composeInstance(dm, idx++, null, [0, b.pivotY, 0], [b.lean, b.yaw, b.bend], [0, b.length * 0.76, 0], [b.twigLean, b.twigYaw, b.bend * -0.42], [b.radius * 0.52, b.twigLength, b.radius * 0.52]);
      dm.instanceMatrix.needsUpdate = true;
    }
    const sm = shellRef.current;
    if (sm) {
      sm.count = clusterN;
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        if (!cluster) continue;
        composeSimple(sm, i, null, cluster.position, cluster.rotation, cluster.outerScale);
      }
      sm.instanceMatrix.needsUpdate = true;
    }
    const cm = coreRef.current;
    if (cm) {
      cm.count = clusterN;
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        if (!cluster) continue;
        composeSimple(cm, i, null, cluster.position, cluster.rotation, cluster.innerScale);
      }
      cm.instanceMatrix.needsUpdate = true;
    }
  }, [branches, roots, clusters, scale, barkN, darkN, clusterN]);

  useEffect(() => () => { canopyGeo.dispose(); groundGeo.dispose(); fallingGeo.dispose(); fallingMat.dispose(); }, [canopyGeo, groundGeo, fallingGeo, fallingMat]);

  useFrame((state) => {
    const parent = fallingRef.current?.parent;
    if (parent && !parent.visible) return;
    const elapsed = state.clock.getElapsedTime();
    const m = fallingRef.current?.material as THREE.ShaderMaterial | undefined;
    if (m?.uniforms) {
      const uTime = m.uniforms['uTime'];
      const uScale = m.uniforms['uScale'];
      if (uTime) uTime.value = elapsed;
      if (uScale) uScale.value = state.gl.domElement.height * 0.5;
    }
    if (crownRef.current) {
      crownRef.current.rotation.z = Math.sin(elapsed * 0.42 + scale) * 0.028;
      crownRef.current.rotation.x = Math.cos(elapsed * 0.35 + scale * 0.6) * 0.012;
      crownRef.current.position.x = Math.sin(elapsed * 0.28 + scale) * 0.04 * scale;
    }
  });

  return (
    <group position={[0, 0.02, 0]}>
      <group position={[0, th * 0.5, 0]} rotation={[0.02, 0, -0.04]}>
        <mesh geometry={geo.limb} material={mat.bark} scale={[0.3 * scale, th, 0.3 * scale]} castShadow receiveShadow />
        <mesh geometry={geo.trunkTop} material={mat.barkDark} position={[0, th * 0.48, 0]} scale={[0.24 * scale, 0.32 * scale, 0.24 * scale]} castShadow receiveShadow />
      </group>
      <instancedMesh ref={barkLimbRef} args={[geo.limb, mat.bark, barkN]} />
      <instancedMesh ref={darkLimbRef} args={[geo.limb, mat.barkDark, darkN]} />
      <group ref={crownRef}>
        <instancedMesh ref={shellRef} args={[geo.canopyCluster, mat.blossomShell, clusterN]} castShadow />
        <instancedMesh ref={coreRef} args={[geo.canopyCore, mat.blossomCore, clusterN]} />
        <points geometry={canopyGeo}><pointsMaterial size={0.08 * scale} sizeAttenuation vertexColors transparent opacity={0.82} depthWrite={false} /></points>
      </group>
      <points ref={fallingRef} geometry={fallingGeo} material={fallingMat} frustumCulled={false} />
      <points geometry={groundGeo}><pointsMaterial size={0.085 * scale} sizeAttenuation vertexColors transparent opacity={0.7} depthWrite={false} /></points>
    </group>
  );
}

const SOLO_FALLING_VERT = /* glsl */ `
attribute vec3 color;
attribute vec4 aParams1;
attribute vec2 aParams2;
uniform float uTime;
uniform float uPointSize;
uniform float uScale;
varying vec3 vColor;
void main() {
  float cycle = fract(uTime * aParams1.x + aParams1.y);
  float drift = 1.0 - pow(cycle, 1.22);
  float w = uTime * aParams1.w + aParams1.y * 6.28318;
  vec3 pos = vec3(
    position.x + sin(w) * aParams1.z + aParams2.x * cycle,
    0.18 + position.y * drift + sin(w * 0.6) * 0.06,
    position.z + cos(w * 0.82) * aParams1.z * 0.72 + aParams2.y * cycle
  );
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize * (uScale / -mvPosition.z);
}
`;
