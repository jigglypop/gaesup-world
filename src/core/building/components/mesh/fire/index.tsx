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
type FireMaterialInstance = THREE.ShaderMaterial & FireUniforms;

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
  float angle = t * 8.0 + aDrift;
  float radius = 0.08 + t * 0.2;
  pos.y += t * t * 3.2;
  pos.x += sin(angle) * radius;
  pos.z += cos(angle) * radius;
  float flicker = 0.75 + 0.25 * sin(uTime * 14.0 + aDrift * 4.0);
  vAlpha = (1.0 - t) * (1.0 - t) * 0.9 * flicker;
  vHeat = 1.0 - t * 0.85;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(4.5, 0.6, t) * (220.0 / -mvPosition.z);
}
`;

const EMBER_FRAG = `
varying float vAlpha;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float glow = smoothstep(0.5, 0.05, d);
  vec3 red = vec3(0.75, 0.12, 0.02);
  vec3 orange = vec3(1.0, 0.5, 0.08);
  vec3 hot = vec3(1.0, 0.92, 0.65);
  vec3 color = mix(red, orange, vHeat);
  color = mix(color, hot, vHeat * vHeat);
  gl_FragColor = vec4(color * glow * 1.4, vAlpha * glow);
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
        emissive: new THREE.Color('#3a0c00'), emissiveIntensity: 0.8,
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

  const geo = getSharedGeo();
  const mat = getSharedMat();

  // Logs and charcoal must scale with the fire's footprint, otherwise large
  // bonfires end up with tiny matchstick logs floating in the middle. Use the
  // mean of width/height as a uniform reference scale.
  const baseScale = useMemo(() => Math.max(0.4, (width + height * 0.5) / 1.5), [width, height]);

  const billboardLayers = useMemo(() => [
    { w: width * 0.78, h: height, x: 0, y: height * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1.0, speed: 1.45, tOff: 0, iMul: 1.0 },
    { w: width * 0.52, h: height * 0.85, x: -width * 0.12, y: height * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: width * 0.42, h: height * 0.7, x: width * 0.14, y: height * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 },
  ], [width, height]);
  const materialRefs = useMemo(
    () => billboardLayers.map(() => React.createRef<FireMaterialInstance>()),
    [billboardLayers],
  );

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
      const m = materialRefs[i]?.current;
      if (!m) continue;
      const l = billboardLayers[i];
      if (!l) continue;
      m.time = t * l.speed + l.tOff;
      m.intensity = intensity * l.iMul;
      m.seed = l.seed;
      m.lean = l.lean;
      m.flare = l.flare;
      m.tint = tintColor;
    }

    const emberTime = mat.ember.uniforms['uTime'];
    if (emberTime) emberTime.value = t;
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

      <mesh
        geometry={geo.log}
        material={mat.log}
        position={[0.12 * baseScale, 0.06 * baseScale, 0.05 * baseScale]}
        rotation={[0.3, 0, 0.65]}
        scale={baseScale}
      />
      <mesh
        geometry={geo.log}
        material={mat.log}
        position={[-0.1 * baseScale, 0.06 * baseScale, 0.08 * baseScale]}
        rotation={[0.25, 1.2, -0.6]}
        scale={baseScale}
      />
      <mesh
        geometry={geo.log}
        material={mat.log}
        position={[0.02 * baseScale, 0.06 * baseScale, -0.13 * baseScale]}
        rotation={[-0.2, 0.6, 1.0]}
        scale={baseScale}
      />

      {billboardLayers.map((l, i) => (
        (() => {
          const geometry = billboardGeos[i];
          const materialRef = materialRefs[i];
          if (!geometry || !materialRef) return null;
          return (
            <mesh key={i} geometry={geometry} position={[l.x, l.y, l.z]}>
              <fireMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          );
        })()
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
  float uy = clamp(uv.y, 0.0, 1.0);

  float sway = sin(vTime * 0.7 + aSeed * 3.14) * 0.04 * uy;
  float bend = aLean * pow(uy, 1.35) * (0.35 + uy * 0.65);
  float wobble = sin((uy * 6.0 + aSeed * 5.73) + py * 1.15) * 0.03 * uy;
  float lift = sin(uv.x * 3.14159 + aSeed * 3.7) * 0.015 * uy;

  vec3 billboarded = right * (px + bend + wobble + sway) + up * (py + lift);

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
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float time = vTime;
  float seed = vSeed;

  vec2 q = vec2(
    fbm(vec2(uv.x * 4.2 + seed * 5.1, uv.y * 5.8 - time * 1.5)),
    fbm(vec2(uv.x * 3.6 - seed * 3.3, uv.y * 4.6 + time * 0.6))
  );
  float n1 = fbm(uv * vec2(3.8, 5.6) + q * 1.5 + vec2(seed * 2.0, -time * 1.1));
  float n2 = noise(vec2(uv.y * 9.0 + seed * 11.0, time * 4.7 + seed * 17.0));

  float skew = vLean * pow(uv.y, 1.2);
  float sway = (n1 - 0.5) * 0.28 * (1.0 - uv.y * 0.35);
  float x = (uv.x - 0.5) - skew + sway;
  float w = mix(0.46 * vFlare, 0.02, pow(uv.y, 0.72));

  float edgeTurb = q.x * 0.07 * uv.y;
  float body = 1.0 - smoothstep(w - edgeTurb, w + 0.06, abs(x));
  float tongue1 = 1.0 - smoothstep(w * 0.82, w * 0.82 + 0.06, abs(x + 0.12 + q.y * 0.08));
  float tongue2 = 1.0 - smoothstep(w * 0.68, w * 0.68 + 0.07, abs(x - 0.1 + q.x * 0.06));

  float baseGlow = 1.0 - smoothstep(0.1, 0.42, distance(uv, vec2(0.5 + skew * 0.1, 0.1)));
  float plume = max(body, max(tongue1 * 0.82, tongue2 * 0.68));

  float bite = smoothstep(0.55, 1.0, n1 + uv.y * 0.4);
  plume *= mix(1.0, 0.72, bite * smoothstep(0.2, 0.85, uv.y));
  plume *= 1.0 - smoothstep(0.8, 1.0, uv.y);
  plume = smoothstep(0.14, 0.9, plume + baseGlow * 0.38 + n1 * 0.2);

  float core = 1.0 - smoothstep(0.01, 0.14, abs(x));
  float fire = clamp(plume * (0.85 + 0.15 * n2), 0.0, 1.0);

  vec3 deepRed = vec3(0.35, 0.02, 0.0);
  vec3 ember   = vec3(0.65, 0.08, 0.01);
  vec3 orange  = vec3(1.0, 0.38, 0.04);
  vec3 golden  = vec3(1.0, 0.65, 0.18);
  vec3 hot     = vec3(1.0, 0.88, 0.55);
  vec3 white   = vec3(1.0, 0.97, 0.92);

  vec3 color = mix(deepRed, ember, smoothstep(0.02, 0.15, fire));
  color = mix(color, orange, smoothstep(0.12, 0.35, fire));
  color = mix(color, golden, smoothstep(0.28, 0.52, fire));
  color = mix(color, hot, smoothstep(0.45, 0.72, fire));
  color = mix(color, white, smoothstep(0.62, 1.0, fire * core));

  float trail = smoothstep(0.8, 1.0, n2 + n1 * 0.3)
    * smoothstep(0.18, 0.7, uv.y)
    * smoothstep(0.35, 0.0, abs(x));
  color += trail * vec3(1.0, 0.4, 0.06) * 0.4;

  float smokeY = smoothstep(0.75, 0.98, uv.y);
  float smoke = smokeY * q.x * 0.22 * smoothstep(0.28, 0.0, abs(x));
  color = mix(color, vec3(0.18, 0.14, 0.12), smoke);

  float alpha = smoothstep(0.06, 0.35, fire) * min(1.0, 0.5 + vIntensity * 0.26);
  alpha += trail * 0.15 + smoke * 0.3;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * vTint * (0.62 + vIntensity * 0.48), alpha);
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
  float angle = t * 8.0 + aDrift;
  float radius = 0.08 + t * 0.2;
  pos.y += t * t * 3.2;
  pos.x += sin(angle) * radius;
  pos.z += cos(angle) * radius;
  float flicker = 0.75 + 0.25 * sin(uTime * 14.0 + aDrift * 4.0);
  vAlpha = (1.0 - t) * (1.0 - t) * 0.9 * flicker;
  vHeat = 1.0 - t * 0.85;
  vec4 mvPosition = modelViewMatrix * vec4(pos + aFirePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(4.5, 0.6, t) * (220.0 / -mvPosition.z);
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
const _fbCol = new THREE.Color();

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
      const s = Math.max(0.4, (fire.width + fire.height * 0.5) / 1.5);

      _fbObj.position.set(0.12 * s, 0.06 * s, 0.05 * s);
      _fbObj.rotation.set(0.3, 0, 0.65);
      _fbObj.scale.set(s, s, s);
      _fbObj.updateMatrix();
      _fbMat.multiplyMatrices(_fbGrp.matrix, _fbObj.matrix);
      mesh.setMatrixAt(idx++, _fbMat);

      _fbObj.position.set(-0.1 * s, 0.06 * s, 0.08 * s);
      _fbObj.rotation.set(0.25, 1.2, -0.6);
      _fbObj.scale.set(s, s, s);
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

    // setColorAt 은 instanceColor 가 없으면 자동 생성하고, 있으면 in-place 로 갱신한다.
    // 매 갱신마다 InstancedBufferAttribute 를 새로 만들어 GPU 버퍼를 dispose 없이 교체하던
    // 기존 구현은 WebGL 리소스 누수를 일으켰다.
    for (let i = 0; i < N; i++) {
      const f = fires[i]!;
      _fbObj.position.set(f.position[0], f.position[1] + 0.02, f.position[2]);
      _fbObj.rotation.set(-Math.PI / 2, 0, f.rotation);
      _fbObj.scale.set(f.width, f.width, 1);
      _fbObj.updateMatrix();
      mesh.setMatrixAt(i, _fbObj.matrix);
      _fbCol.set(f.color);
      mesh.setColorAt(i, _fbCol);
    }
    mesh.count = N;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [fires, N]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    bbMat.uniforms['uTime']!.value = t;
    bEmberMat.uniforms['uTime']!.value = t;
    glowMat.opacity = 0.16 + Math.sin(t * 2.5) * 0.06;
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
