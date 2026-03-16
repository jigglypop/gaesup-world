import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type SakuraProps = { size?: number };

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

let _sharedMat: {
  bark: THREE.MeshStandardMaterial; barkDark: THREE.MeshStandardMaterial;
  blossomShell: THREE.MeshStandardMaterial; blossomCore: THREE.MeshStandardMaterial;
} | null = null;

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

function getSharedMaterials() {
  if (!_sharedMat) {
    _sharedMat = {
      bark: new THREE.MeshStandardMaterial({ color: '#5e3d30', roughness: 0.95, metalness: 0.02 }),
      barkDark: new THREE.MeshStandardMaterial({ color: '#3f271e', roughness: 1, metalness: 0.01 }),
      blossomShell: new THREE.MeshStandardMaterial({ color: '#f7bfd2', roughness: 0.92, metalness: 0.0, transparent: true, opacity: 0.68 }),
      blossomCore: new THREE.MeshStandardMaterial({ color: '#ffe6f0', roughness: 0.84, metalness: 0.0, transparent: true, opacity: 0.5 }),
    };
  }
  return _sharedMat;
}

// --- Tree structure generators ---

function createBranches(scale: number, trunkHeight: number): BranchSpec[] {
  const n = Math.max(11, Math.min(18, Math.round(10 + scale * 4)));
  return Array.from({ length: n }, (_, i) => {
    const s = 19.3 + i * 13.17 + scale * 5.1;
    const len = (1.05 + hash01(s + 1) * 1.35) * scale;
    const dir = hash01(s + 2) > 0.5 ? 1 : -1;
    return {
      pivotY: trunkHeight * (0.38 + hash01(s + 3) * 0.42), length: len,
      radius: (0.08 + hash01(s + 4) * 0.045) * scale,
      yaw: hash01(s + 5) * Math.PI * 2, bend: (0.58 + hash01(s + 6) * 0.34) * dir,
      lean: (hash01(s + 7) - 0.5) * 0.34, twigLength: len * (0.34 + hash01(s + 8) * 0.26),
      twigYaw: (hash01(s + 9) - 0.5) * 0.95, twigLean: (0.25 + hash01(s + 10) * 0.38) * -dir,
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

function createClusters(scale: number, th: number, cr: number, ch: number): ClusterSpec[] {
  const n = Math.max(9, Math.min(16, Math.round(9 + scale * 4)));
  return Array.from({ length: n }, (_, i) => {
    const s = 220.4 + i * 10.73 + scale * 4.4;
    const a = hash01(s) * Math.PI * 2;
    const rad = cr * (0.18 + hash01(s + 1) * 0.72);
    const ox = (0.7 + hash01(s + 5) * 0.9) * scale;
    const oy = (0.52 + hash01(s + 6) * 0.56) * scale;
    const oz = (0.66 + hash01(s + 7) * 0.88) * scale;
    return {
      position: [Math.cos(a) * rad, th * (0.64 + hash01(s + 3) * 0.22) + hash01(s + 4) * ch * 0.42, Math.sin(a) * rad * (0.86 + hash01(s + 2) * 0.22)],
      rotation: [(hash01(s + 8) - 0.5) * 0.55, hash01(s + 9) * Math.PI * 2, (hash01(s + 10) - 0.5) * 0.55],
      outerScale: [ox, oy, oz],
      innerScale: [ox * 0.7, oy * 0.72, oz * 0.7],
    };
  });
}

// --- Matrix composition helpers ---

const _grp = new THREE.Object3D();
const _obj = new THREE.Object3D();
const _composed = new THREE.Matrix4();
const _treeXlat = new THREE.Matrix4();

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
) {
  const a = new THREE.Color('#f3a1bf'), b = new THREE.Color('#fff1f6'), t = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const s = 330.7 + i * 17.13;
    const ang = hash01(s) * Math.PI * 2;
    const ring = cr * (0.18 + Math.sqrt(hash01(s + 1)) * 0.86);
    const idx = (start + i) * 3;
    pos[idx] = Math.cos(ang) * ring * (0.82 + hash01(s + 2) * 0.22) + ox;
    pos[idx + 1] = th * 0.58 + Math.pow(hash01(s + 4), 0.72) * ch + (hash01(s + 5) - 0.5) * 0.36 + oy;
    pos[idx + 2] = Math.sin(ang) * ring * (0.8 + hash01(s + 3) * 0.26) + oz;
    t.copy(a).lerp(b, 0.28 + hash01(s + 6) * 0.72).multiplyScalar(0.92 + hash01(s + 7) * 0.18);
    setColor(col, idx, t);
  }
}

function fillGround(
  pos: Float32Array, col: Float32Array, start: number, count: number,
  cr: number, ox: number, oy: number, oz: number,
) {
  const a = new THREE.Color('#f7cadb'), b = new THREE.Color('#fff3f8'), t = new THREE.Color();
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
) {
  const a = new THREE.Color('#f8b3ca'), b = new THREE.Color('#fff5fa'), t = new THREE.Color();
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
};

type TreeSpec = {
  pos: [number, number, number];
  scale: number; trunkHeight: number; crownRadius: number; crownHeight: number;
  branches: BranchSpec[]; roots: RootSpec[]; clusters: ClusterSpec[];
  canopyN: number; groundN: number; fallingN: number;
};

function computeSpecs(trees: SakuraTreeEntry[]): TreeSpec[] {
  return trees.map(t => {
    const s = THREE.MathUtils.clamp(t.size / 4, 0.95, 1.85);
    const th = 3.8 * s;
    const cr = 1.65 * s + Math.min(t.size * 0.08, 0.55);
    const ch = 2.15 * s + Math.min(t.size * 0.04, 0.35);
    return {
      pos: t.position, scale: s, trunkHeight: th, crownRadius: cr, crownHeight: ch,
      branches: createBranches(s, th), roots: createRoots(s),
      clusters: createClusters(s, th, cr, ch),
      canopyN: Math.max(180, Math.min(420, Math.round(210 + s * 95))),
      groundN: Math.max(44, Math.min(120, Math.round(54 + s * 26))),
      fallingN: Math.max(52, Math.min(132, Math.round(62 + s * 30))),
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

varying vec3 vColor;

void main() {
  float cycle = fract(uTime * aParams1.x + aParams1.y);
  float drift = 1.0 - pow(cycle, 1.22);
  float w = uTime * aParams1.w + aParams1.y * 6.28318;

  vec3 localPos = vec3(
    position.x + sin(w) * aParams1.z + aParams2.x * cycle,
    0.18 + position.y * drift + sin(w * 0.6) * 0.06,
    position.z + cos(w * 0.82) * aParams1.z * 0.72 + aParams2.y * cycle
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

export function SakuraBatch({ trees }: { trees: SakuraTreeEntry[] }) {
  const barkRef = useRef<THREE.InstancedMesh>(null!);
  const darkRef = useRef<THREE.InstancedMesh>(null!);
  const topRef = useRef<THREE.InstancedMesh>(null!);
  const shellRef = useRef<THREE.InstancedMesh>(null!);
  const coreRef = useRef<THREE.InstancedMesh>(null!);
  const fallingRef = useRef<THREE.Points>(null!);

  const geo = getSharedGeometry();
  const mat = getSharedMaterials();
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

  const canopyGeo = useMemo(() => {
    const p = new Float32Array(counts.canopy * 3), c = new Float32Array(counts.canopy * 3);
    let off = 0;
    for (const s of specs) {
      fillCanopy(p, c, off, s.canopyN, s.trunkHeight, s.crownRadius, s.crownHeight, s.pos[0], s.pos[1] + 0.02, s.pos[2]);
      off += s.canopyN;
    }
    return makePointsGeo(p, c);
  }, [specs, counts.canopy]);

  const groundGeo = useMemo(() => {
    const p = new Float32Array(counts.ground * 3), c = new Float32Array(counts.ground * 3);
    let off = 0;
    for (const s of specs) {
      fillGround(p, c, off, s.groundN, s.crownRadius, s.pos[0], s.pos[1] + 0.02, s.pos[2]);
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
      fillFalling(pos, col, p1, p2, tp, ps, off, s.fallingN,
        s.trunkHeight, s.crownRadius, s.crownHeight, s.scale,
        s.pos[0], s.pos[1] + 0.02, s.pos[2]);
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
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uOpacity: { value: 0.88 } },
    vertexShader: BATCH_FALLING_VERT,
    fragmentShader: BATCH_FALLING_FRAG,
    transparent: true, depthWrite: false,
  }), []);

  useLayoutEffect(() => {
    let bi = 0, di = 0, ti = 0, si = 0, ci = 0;

    for (const s of specs) {
      const tp = s.pos;

      composeInstance(barkRef.current, bi++, tp,
        [0, s.trunkHeight * 0.5, 0], [0.02, 0, -0.04],
        [0, 0, 0], null, [0.3 * s.scale, s.trunkHeight, 0.3 * s.scale]);

      composeInstance(topRef.current, ti++, tp,
        [0, s.trunkHeight * 0.5, 0], [0.02, 0, -0.04],
        [0, s.trunkHeight * 0.48, 0], null, [0.24 * s.scale, 0.32 * s.scale, 0.24 * s.scale]);

      for (const b of s.branches) {
        composeInstance(barkRef.current, bi++, tp,
          [0, b.pivotY, 0], [b.lean, b.yaw, b.bend],
          [0, b.length * 0.5, 0], null, [b.radius, b.length, b.radius]);
      }

      for (const r of s.roots) {
        composeInstance(darkRef.current, di++, tp,
          [0, 0.14 * s.scale, 0], [0, r.angle, r.spread],
          [0, r.length * 0.22, 0], null, [r.radius, r.length, r.radius]);
      }
      for (const b of s.branches) {
        composeInstance(darkRef.current, di++, tp,
          [0, b.pivotY, 0], [b.lean, b.yaw, b.bend],
          [0, b.length * 0.76, 0], [b.twigLean, b.twigYaw, b.bend * -0.42],
          [b.radius * 0.52, b.twigLength, b.radius * 0.52]);
      }

      for (const c of s.clusters) {
        composeSimple(shellRef.current, si++, tp, c.position, c.rotation, c.outerScale);
        composeSimple(coreRef.current, ci++, tp, c.position, c.rotation, c.innerScale);
      }
    }

    for (const [ref, count] of [[barkRef, bi], [darkRef, di], [topRef, ti], [shellRef, si], [coreRef, ci]] as const) {
      ref.current.count = count as number;
      ref.current.instanceMatrix.needsUpdate = true;
    }
  }, [specs]);

  useEffect(() => () => {
    canopyGeo.dispose(); groundGeo.dispose();
    fallingGeo.dispose(); fallingMat.dispose();
  }, [canopyGeo, groundGeo, fallingGeo, fallingMat]);

  useFrame((state) => {
    const m = fallingRef.current?.material as THREE.ShaderMaterial | undefined;
    if (m?.uniforms) {
      m.uniforms.uTime.value = state.clock.getElapsedTime();
      m.uniforms.uScale.value = state.gl.domElement.height * 0.5;
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

export default function Sakura({ size = 4 }: SakuraProps) {
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

  const geo = getSharedGeometry();
  const mat = getSharedMaterials();

  const branches = useMemo(() => createBranches(scale, th), [scale, th]);
  const roots = useMemo(() => createRoots(scale), [scale]);
  const clusters = useMemo(() => createClusters(scale, th, cr, ch), [scale, th, cr, ch]);

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
    if (sm) { sm.count = clusterN; for (let i = 0; i < clusters.length; i++) composeSimple(sm, i, null, clusters[i].position, clusters[i].rotation, clusters[i].outerScale); sm.instanceMatrix.needsUpdate = true; }
    const cm = coreRef.current;
    if (cm) { cm.count = clusterN; for (let i = 0; i < clusters.length; i++) composeSimple(cm, i, null, clusters[i].position, clusters[i].rotation, clusters[i].innerScale); cm.instanceMatrix.needsUpdate = true; }
  }, [branches, roots, clusters, scale, barkN, darkN, clusterN]);

  useEffect(() => () => { canopyGeo.dispose(); groundGeo.dispose(); fallingGeo.dispose(); fallingMat.dispose(); }, [canopyGeo, groundGeo, fallingGeo, fallingMat]);

  useFrame((state) => {
    const parent = fallingRef.current?.parent;
    if (parent && !parent.visible) return;
    const elapsed = state.clock.getElapsedTime();
    const m = fallingRef.current?.material as THREE.ShaderMaterial | undefined;
    if (m?.uniforms) { m.uniforms.uTime.value = elapsed; m.uniforms.uScale.value = state.gl.domElement.height * 0.5; }
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
