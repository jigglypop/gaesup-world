import React, { FC, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import fragmentShader from './frag.glsl';
import vertexShader from './vert.glsl';

const FireMaterial = shaderMaterial(
  { time: 0, intensity: 1.5, seed: 0, lean: 0, flare: 1, tint: new THREE.Color(1, 1, 1) },
  vertexShader,
  fragmentShader,
);

extend({ FireMaterial });

type FireUniforms = {
  time: number;
  intensity: number;
  seed: number;
  lean: number;
  flare: number;
  tint: THREE.Color;
};

const EMBER_VERT = `
attribute float aLife;
attribute float aSpeed;
attribute float aDrift;
varying float vAlpha;
varying float vHeat;
uniform float uTime;

void main() {
  float t = fract(uTime * aSpeed + aLife);
  vec3 pos = position;
  pos.y += t * 2.8;
  pos.x += sin(t * 6.28318 + aDrift) * 0.14;
  pos.z += cos(t * 5.0 + aDrift * 1.7) * 0.1;
  vAlpha = (1.0 - t) * (1.0 - t) * 0.85;
  vHeat = 1.0 - t;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(3.5, 0.5, t) * (200.0 / -mvPosition.z);
}
`;

const EMBER_FRAG = `
varying float vAlpha;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float glow = 1.0 - d * 2.0;
  vec3 color = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.85, 0.35), vHeat * vHeat);
  gl_FragColor = vec4(color * glow, vAlpha * glow);
}
`;

const EMBER_COUNT = 18;

// --- Shared GPU resources (singleton across all Fire instances) ---

let _sharedGeo: {
  log: THREE.CylinderGeometry;
  charcoal: THREE.CircleGeometry;
  glow: THREE.CircleGeometry;
} | null = null;

let _sharedMat: {
  log: THREE.MeshStandardMaterial;
  charcoal: THREE.MeshStandardMaterial;
  ember: THREE.ShaderMaterial;
} | null = null;

function getSharedGeo() {
  if (!_sharedGeo) {
    _sharedGeo = {
      log: new THREE.CylinderGeometry(0.035, 0.045, 0.5, 5),
      charcoal: new THREE.CircleGeometry(0.18, 6),
      glow: new THREE.CircleGeometry(0.7, 8),
    };
  }
  return _sharedGeo;
}

function getSharedMat() {
  if (!_sharedMat) {
    _sharedMat = {
      log: new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 1 }),
      charcoal: new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 1,
        emissive: new THREE.Color('#220800'), emissiveIntensity: 0.5,
      }),
      ember: new THREE.ShaderMaterial({
        vertexShader: EMBER_VERT,
        fragmentShader: EMBER_FRAG,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }
  return _sharedMat;
}

interface FireProps {
  intensity?: number;
  width?: number;
  height?: number;
  color?: string;
}

const Fire: FC<FireProps> = ({ intensity = 1.5, width = 1.0, height = 1.5, color = '#ffffff' }) => {
  const tintColor = useMemo(() => new THREE.Color(color), [color]);
  const matRefs = useRef<(THREE.Material | null)[]>([]);

  const geo = getSharedGeo();
  const mat = getSharedMat();

  const billboardLayers = useMemo(() => [
    { w: width * 0.78, h: height, x: 0, y: height * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1.0, speed: 1.45, tOff: 0, iMul: 1.0 },
    { w: width * 0.52, h: height * 0.85, x: -width * 0.12, y: height * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: width * 0.42, h: height * 0.7, x: width * 0.14, y: height * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 },
  ], [width, height]);

  const billboardGeos = useMemo(
    () => billboardLayers.map(l => new THREE.PlaneGeometry(l.w, l.h)),
    [billboardLayers],
  );

  const emberGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(EMBER_COUNT * 3);
    const life = new Float32Array(EMBER_COUNT);
    const speed = new Float32Array(EMBER_COUNT);
    const drift = new Float32Array(EMBER_COUNT);
    for (let i = 0; i < EMBER_COUNT; i++) {
      p[i * 3] = (Math.random() - 0.5) * width * 0.35;
      p[i * 3 + 1] = Math.random() * height * 0.2;
      p[i * 3 + 2] = (Math.random() - 0.5) * width * 0.35;
      life[i] = Math.random();
      speed[i] = 0.12 + Math.random() * 0.22;
      drift[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aDrift', new THREE.BufferAttribute(drift, 1));
    return g;
  }, [width, height]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < billboardLayers.length; i++) {
      const m = matRefs.current[i];
      if (!m) continue;
      const l = billboardLayers[i];
      const u = m as unknown as FireUniforms;
      u.time = t * l.speed + l.tOff;
      u.intensity = intensity * l.iMul;
      u.seed = l.seed;
      u.lean = l.lean;
      u.flare = l.flare;
      u.tint = tintColor;
    }

    mat.ember.uniforms.uTime.value = t;
  });

  useEffect(() => {
    return () => {
      billboardGeos.forEach(g => g.dispose());
      emberGeo.dispose();
    };
  }, [billboardGeos, emberGeo]);

  return (
    <group>
      <mesh
        geometry={geo.glow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[width, width, 1]}
      >
        <meshBasicMaterial
          color={tintColor}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        geometry={geo.charcoal}
        material={mat.charcoal}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.018, 0]}
        scale={[width, width, 1]}
      />

      <mesh geometry={geo.log} material={mat.log} position={[0.12, 0.06, 0.05]} rotation={[0.3, 0, 0.65]} />
      <mesh geometry={geo.log} material={mat.log} position={[-0.1, 0.06, 0.08]} rotation={[0.25, 1.2, -0.6]} />

      {billboardLayers.map((l, i) => (
        <mesh key={i} geometry={billboardGeos[i]} position={[l.x, l.y, l.z]}>
          <fireMaterial
            ref={(el: THREE.Material | null) => { matRefs.current[i] = el; }}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <points geometry={emberGeo} material={mat.ember} />
    </group>
  );
};

export default React.memo(Fire);

// ============================================================
// FireBatch -- renders ALL fires with 5 draw calls
// CE S(D)=e^{-D}: fold N*8 individual draw calls into 5
// ============================================================

const FIRE_BATCH_VERT = /* glsl */ `
attribute float aSeed;
attribute float aLean;
attribute float aFlare;
attribute float aIntensity;
attribute float aSpeed;
attribute float aTOff;
attribute float aWidth;
attribute float aHeight;
attribute vec3 aTint;
uniform float uTime;

varying vec2 vUv;
varying float vSeed;
varying float vLean;
varying float vFlare;
varying float vIntensity;
varying float vTime;
varying vec3 vTint;

void main() {
  vUv = uv;
  vSeed = aSeed;
  vLean = aLean;
  vFlare = aFlare;
  vIntensity = aIntensity;
  vTint = aTint;
  vTime = uTime * aSpeed + aTOff;

  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(0.0, 1.0, 0.0);

  float px = position.x * aWidth;
  float py = position.y * aHeight;

  float bend = aLean * pow(clamp(uv.y, 0.0, 1.0), 1.35) * (0.35 + uv.y * 0.65);
  float wobble = sin((uv.y * 6.0 + aSeed * 5.73) + py * 1.15) * 0.035 * uv.y;
  float lift = sin(uv.x * 3.14159 + aSeed * 3.7) * 0.018 * uv.y;

  vec3 billboarded = right * (px + bend + wobble) + up * (py + lift);

  vec4 center = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  center.xyz += billboarded;

  gl_Position = projectionMatrix * viewMatrix * center;
}
`;

const FIRE_BATCH_FRAG = /* glsl */ `
varying vec2 vUv;
varying float vSeed;
varying float vLean;
varying float vFlare;
varying float vIntensity;
varying float vTime;
varying vec3 vTint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float time = vTime;
  float intensity = vIntensity;
  float seed = vSeed;
  float lean = vLean;
  float flare = vFlare;

  float n1 = fbm(vec2(uv.x * 3.8 + seed * 7.3, uv.y * 5.6 - time * (1.6 + flare * 0.18)));
  float n2 = fbm(vec2(uv.x * 7.9 - seed * 4.1, uv.y * 10.8 - time * 2.8));
  float n3 = noise(vec2(uv.y * 9.0 + seed * 11.0, time * 4.7 + seed * 17.0));
  float n4 = fbm(vec2(uv.x * 12.5 + seed * 2.7, uv.y * 8.0 - time * 2.2));
  float n5 = fbm(vec2(uv.x * 5.2 + seed * 3.9 + time * 0.4, uv.y * 14.0 - time * 3.5));

  float skew = lean * pow(uv.y, 1.2);
  float sway = (n1 - 0.5) * 0.25 * (1.0 - uv.y * 0.35);
  float x = (uv.x - 0.5) - skew + sway;
  float width = mix(0.46 * flare, 0.04, pow(uv.y, 0.78));

  float centerBody = 1.0 - smoothstep(width, width + 0.08 + n2 * 0.05, abs(x));
  float leftTongue = 1.0 - smoothstep(width * 0.86, width * 0.86 + 0.07, abs(x + 0.13 + (n2 - 0.5) * 0.09));
  float rightTongue = 1.0 - smoothstep(width * 0.74, width * 0.74 + 0.07, abs(x - 0.11 + (n4 - 0.5) * 0.09));
  float backFlame = 1.0 - smoothstep(width * 0.68, width * 0.68 + 0.1, abs(x + (n5 - 0.5) * 0.06));

  float bite = smoothstep(0.60, 1.0, n4 + uv.y * 0.38);
  float baseGlow = 1.0 - smoothstep(0.12, 0.48, distance(uv, vec2(0.5 + skew * 0.12, 0.12)));
  float plume = max(centerBody, max(leftTongue * 0.84, max(rightTongue * 0.78, backFlame * 0.6)));
  plume *= mix(1.0, 0.78, bite * smoothstep(0.22, 0.9, uv.y));
  plume *= 1.0 - smoothstep(0.82, 1.0, uv.y);
  plume = smoothstep(0.16, 0.92, plume + baseGlow * 0.35 + n1 * 0.2 + n2 * 0.12 * (1.0 - uv.y));

  float emberTrail = smoothstep(0.82, 1.0, n3 + n2 * 0.35)
    * smoothstep(0.14, 0.78, uv.y)
    * smoothstep(0.42, 0.0, abs(x));
  float core = 1.0 - smoothstep(0.02, 0.16 + n1 * 0.04, abs(x));
  float fire = clamp(plume * (0.88 + 0.12 * n3), 0.0, 1.0);

  vec3 deepEmber = vec3(0.45, 0.04, 0.0);
  vec3 ember = vec3(0.72, 0.12, 0.01);
  vec3 flame = vec3(1.0, 0.42, 0.04);
  vec3 hot = vec3(1.0, 0.78, 0.38);
  vec3 whiteHot = vec3(1.0, 0.96, 0.88);

  vec3 color = mix(deepEmber, ember, smoothstep(0.04, 0.2, fire));
  color = mix(color, flame, smoothstep(0.15, 0.42, fire));
  color = mix(color, hot, smoothstep(0.36, 0.72, fire));
  color = mix(color, whiteHot, smoothstep(0.60, 1.0, fire * core));
  color += emberTrail * vec3(1.0, 0.45, 0.08) * 0.5;

  float smokeY = smoothstep(0.72, 0.98, uv.y);
  float smokeNoise = fbm(vec2(uv.x * 6.0 + time * 0.3, uv.y * 4.0 - time * 0.8));
  float smoke = smokeY * smokeNoise * 0.25 * smoothstep(0.3, 0.0, abs(x));
  color = mix(color, vec3(0.15, 0.12, 0.1), smoke);

  float alpha = smoothstep(0.08, 0.38, fire) * min(1.0, 0.48 + intensity * 0.24);
  alpha += emberTrail * 0.18;
  alpha += smoke * 0.35;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * vTint * (0.65 + intensity * 0.45), alpha);
}
`;

const BATCH_EMBER_VERT = /* glsl */ `
attribute float aLife;
attribute float aSpeed;
attribute float aDrift;
attribute vec3 aFirePos;
uniform float uTime;
varying float vAlpha;
varying float vHeat;

void main() {
  float t = fract(uTime * aSpeed + aLife);
  vec3 pos = position;
  pos.y += t * 2.8;
  pos.x += sin(t * 6.28318 + aDrift) * 0.14;
  pos.z += cos(t * 5.0 + aDrift * 1.7) * 0.1;
  vAlpha = (1.0 - t) * (1.0 - t) * 0.85;
  vHeat = 1.0 - t;
  vec4 mvPosition = modelViewMatrix * vec4(pos + aFirePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(3.5, 0.5, t) * (200.0 / -mvPosition.z);
}
`;

const FIRE_LAYERS = [
  { wMul: 0.78, hMul: 1.0, xMul: 0, yMul: 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1.0, speed: 1.45, tOff: 0, iMul: 1.0 },
  { wMul: 0.52, hMul: 0.85, xMul: -0.12, yMul: 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
  { wMul: 0.42, hMul: 0.7, xMul: 0.14, yMul: 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 },
];

let _batchBillboardMat: THREE.ShaderMaterial | null = null;
let _batchEmberMat: THREE.ShaderMaterial | null = null;
let _batchGlowMat: THREE.MeshBasicMaterial | null = null;

function getBatchBillboardMat() {
  if (!_batchBillboardMat) {
    _batchBillboardMat = new THREE.ShaderMaterial({
      vertexShader: FIRE_BATCH_VERT,
      fragmentShader: FIRE_BATCH_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }
  return _batchBillboardMat;
}

function getBatchEmberMat() {
  if (!_batchEmberMat) {
    _batchEmberMat = new THREE.ShaderMaterial({
      vertexShader: BATCH_EMBER_VERT,
      fragmentShader: EMBER_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }
  return _batchEmberMat;
}

function getBatchGlowMat() {
  if (!_batchGlowMat) {
    _batchGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
  return _batchGlowMat;
}

export type FireBatchEntry = {
  position: [number, number, number];
  rotation: number;
  intensity: number;
  width: number;
  height: number;
  color: string;
};

const _fbGrp = new THREE.Object3D();
const _fbObj = new THREE.Object3D();
const _fbMat = new THREE.Matrix4();

export const FireBatch = React.memo(function FireBatch({ fires }: { fires: FireBatchEntry[] }) {
  const billboardRef = useRef<THREE.InstancedMesh>(null!);
  const logRef = useRef<THREE.InstancedMesh>(null!);
  const charRef = useRef<THREE.InstancedMesh>(null!);
  const glowRef = useRef<THREE.InstancedMesh>(null!);
  const emberRef = useRef<THREE.Points>(null!);

  const N = fires.length;
  const billboardCount = N * FIRE_LAYERS.length;
  const logCount = N * 2;
  const geo = getSharedGeo();
  const mat = getSharedMat();
  const bbMat = getBatchBillboardMat();
  const glowMat = getBatchGlowMat();
  const bEmberMat = getBatchEmberMat();

  const billboardGeo = useMemo(() => {
    if (N === 0) return null;
    const g = new THREE.PlaneGeometry(1, 1);
    const seeds = new Float32Array(billboardCount);
    const leans = new Float32Array(billboardCount);
    const flares = new Float32Array(billboardCount);
    const intensities = new Float32Array(billboardCount);
    const speeds = new Float32Array(billboardCount);
    const tOffs = new Float32Array(billboardCount);
    const widths = new Float32Array(billboardCount);
    const heights = new Float32Array(billboardCount);
    const tints = new Float32Array(billboardCount * 3);

    let idx = 0;
    for (const fire of fires) {
      const tint = new THREE.Color(fire.color);
      for (const layer of FIRE_LAYERS) {
        seeds[idx] = layer.seed;
        leans[idx] = layer.lean;
        flares[idx] = layer.flare;
        intensities[idx] = fire.intensity * layer.iMul;
        speeds[idx] = layer.speed;
        tOffs[idx] = layer.tOff;
        widths[idx] = fire.width * layer.wMul;
        heights[idx] = fire.height * layer.hMul;
        tints[idx * 3] = tint.r;
        tints[idx * 3 + 1] = tint.g;
        tints[idx * 3 + 2] = tint.b;
        idx++;
      }
    }

    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    g.setAttribute('aLean', new THREE.InstancedBufferAttribute(leans, 1));
    g.setAttribute('aFlare', new THREE.InstancedBufferAttribute(flares, 1));
    g.setAttribute('aIntensity', new THREE.InstancedBufferAttribute(intensities, 1));
    g.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
    g.setAttribute('aTOff', new THREE.InstancedBufferAttribute(tOffs, 1));
    g.setAttribute('aWidth', new THREE.InstancedBufferAttribute(widths, 1));
    g.setAttribute('aHeight', new THREE.InstancedBufferAttribute(heights, 1));
    g.setAttribute('aTint', new THREE.InstancedBufferAttribute(tints, 3));
    return g;
  }, [fires, N, billboardCount]);

  const emberGeo = useMemo(() => {
    if (N === 0) return null;
    const EMBER_PER_FIRE = 18;
    const total = N * EMBER_PER_FIRE;
    const pos = new Float32Array(total * 3);
    const life = new Float32Array(total);
    const speed = new Float32Array(total);
    const drift = new Float32Array(total);
    const firePos = new Float32Array(total * 3);

    for (let fi = 0; fi < N; fi++) {
      const f = fires[fi]!;
      const base = fi * EMBER_PER_FIRE;
      for (let i = 0; i < EMBER_PER_FIRE; i++) {
        const gi = base + i;
        pos[gi * 3] = (Math.random() - 0.5) * f.width * 0.35;
        pos[gi * 3 + 1] = Math.random() * f.height * 0.2;
        pos[gi * 3 + 2] = (Math.random() - 0.5) * f.width * 0.35;
        life[gi] = Math.random();
        speed[gi] = 0.12 + Math.random() * 0.22;
        drift[gi] = Math.random() * Math.PI * 2;
        firePos[gi * 3] = f.position[0];
        firePos[gi * 3 + 1] = f.position[1];
        firePos[gi * 3 + 2] = f.position[2];
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aDrift', new THREE.BufferAttribute(drift, 1));
    g.setAttribute('aFirePos', new THREE.BufferAttribute(firePos, 3));
    g.computeBoundingSphere();
    return g;
  }, [fires, N]);

  useLayoutEffect(() => {
    if (N === 0) return;
    const mesh = billboardRef.current;
    if (!mesh) return;

    let idx = 0;
    for (const fire of fires) {
      const cr = Math.cos(fire.rotation);
      const sr = Math.sin(fire.rotation);
      for (const layer of FIRE_LAYERS) {
        const lx = fire.width * layer.xMul;
        const lz = layer.z;
        _fbObj.position.set(
          fire.position[0] + lx * cr + lz * sr,
          fire.position[1] + fire.height * layer.yMul,
          fire.position[2] + lz * cr - lx * sr,
        );
        _fbObj.rotation.set(0, 0, 0);
        _fbObj.scale.set(1, 1, 1);
        _fbObj.updateMatrix();
        mesh.setMatrixAt(idx++, _fbObj.matrix);
      }
    }
    mesh.count = billboardCount;
    mesh.instanceMatrix.needsUpdate = true;
  }, [fires, N, billboardCount]);

  useLayoutEffect(() => {
    if (N === 0) return;
    const mesh = logRef.current;
    if (!mesh) return;

    let idx = 0;
    for (const fire of fires) {
      _fbGrp.position.set(fire.position[0], fire.position[1], fire.position[2]);
      _fbGrp.rotation.set(0, fire.rotation, 0);
      _fbGrp.updateMatrix();

      _fbObj.position.set(0.12, 0.06, 0.05);
      _fbObj.rotation.set(0.3, 0, 0.65);
      _fbObj.scale.set(1, 1, 1);
      _fbObj.updateMatrix();
      _fbMat.multiplyMatrices(_fbGrp.matrix, _fbObj.matrix);
      mesh.setMatrixAt(idx++, _fbMat);

      _fbObj.position.set(-0.1, 0.06, 0.08);
      _fbObj.rotation.set(0.25, 1.2, -0.6);
      _fbObj.updateMatrix();
      _fbMat.multiplyMatrices(_fbGrp.matrix, _fbObj.matrix);
      mesh.setMatrixAt(idx++, _fbMat);
    }
    mesh.count = logCount;
    mesh.instanceMatrix.needsUpdate = true;
  }, [fires, N, logCount]);

  useLayoutEffect(() => {
    if (N === 0) return;
    const mesh = charRef.current;
    if (!mesh) return;

    for (let i = 0; i < N; i++) {
      const f = fires[i]!;
      _fbObj.position.set(f.position[0], f.position[1] + 0.018, f.position[2]);
      _fbObj.rotation.set(-Math.PI / 2, 0, f.rotation);
      _fbObj.scale.set(f.width, f.width, 1);
      _fbObj.updateMatrix();
      mesh.setMatrixAt(i, _fbObj.matrix);
    }
    mesh.count = N;
    mesh.instanceMatrix.needsUpdate = true;
  }, [fires, N]);

  useLayoutEffect(() => {
    if (N === 0) return;
    const mesh = glowRef.current;
    if (!mesh) return;

    const colors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const f = fires[i]!;
      const tint = new THREE.Color(f.color);
      _fbObj.position.set(f.position[0], f.position[1] + 0.02, f.position[2]);
      _fbObj.rotation.set(-Math.PI / 2, 0, f.rotation);
      _fbObj.scale.set(f.width, f.width, 1);
      _fbObj.updateMatrix();
      mesh.setMatrixAt(i, _fbObj.matrix);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }
    mesh.count = N;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  }, [fires, N]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    bbMat.uniforms['uTime']!.value = t;
    bEmberMat.uniforms['uTime']!.value = t;
  });

  useEffect(() => () => {
    billboardGeo?.dispose();
    emberGeo?.dispose();
  }, [billboardGeo, emberGeo]);

  if (N === 0) return null;

  return (
    <>
      {billboardGeo && (
        <instancedMesh
          ref={billboardRef}
          args={[billboardGeo, bbMat, billboardCount]}
          frustumCulled={false}
        />
      )}
      <instancedMesh ref={logRef} args={[geo.log, mat.log, logCount]} />
      <instancedMesh ref={charRef} args={[geo.charcoal, mat.charcoal, N]} />
      <instancedMesh ref={glowRef} args={[geo.glow, glowMat, N]} />
      {emberGeo && (
        <points ref={emberRef} geometry={emberGeo} material={bEmberMat} frustumCulled={false} />
      )}
    </>
  );
});
