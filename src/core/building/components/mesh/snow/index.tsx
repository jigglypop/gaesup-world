import React, { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { loadCoreWasm, type GaesupCoreWasmExports } from '@core/wasm/loader';

const COUNT = 2000;
const NEAR_COUNT = 800;
const HALF_RANGE = 20;
const HEIGHT = 20;
const LOD_INTERVAL = 3;

type SnowProps = {
  /**
   * When true, simulation runs entirely in the vertex shader (zero CPU cost).
   * Disables WASM/JS update path. Recommended for static, area-bound snowfall.
   */
  gpu?: boolean;
};

const GPU_VERT = /* glsl */ `
attribute float aSeed;
attribute float aBaseX;
attribute float aBaseZ;
attribute float aFallSpeed;
attribute float aDriftAmp;

uniform float uTime;
uniform vec3 uOrigin;
uniform float uHalfRange;
uniform float uHeight;
uniform float uPointSize;
uniform float uScale;

void main() {
  float fall = uHeight - mod(uTime * aFallSpeed + aSeed * uHeight * 2.0, uHeight * 1.4);
  float dx = sin(uTime * 0.7 + aSeed * 6.2831) * aDriftAmp;
  float dz = cos(uTime * 0.5 + aSeed * 3.1415) * aDriftAmp;

  float wx = uOrigin.x + mod(aBaseX + dx - uOrigin.x + uHalfRange, uHalfRange * 2.0) - uHalfRange;
  float wz = uOrigin.z + mod(aBaseZ + dz - uOrigin.z + uHalfRange, uHalfRange * 2.0) - uHalfRange;
  float wy = uOrigin.y + fall - uHeight * 0.5;

  vec4 mv = modelViewMatrix * vec4(wx, wy, wz, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPointSize * (uScale / -mv.z);
}
`;

const GPU_FRAG = /* glsl */ `
uniform float uOpacity;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, uOpacity * exp(-r2 * 6.0));
}
`;

let _snowTex: THREE.Texture | null = null;
function getSnowTexture(): THREE.Texture {
  if (_snowTex) return _snowTex;
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 16);
  _snowTex = new THREE.CanvasTexture(c);
  _snowTex.needsUpdate = true;
  return _snowTex;
}

function GpuSnow() {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    const baseX = new Float32Array(COUNT);
    const baseZ = new Float32Array(COUNT);
    const fallSpeed = new Float32Array(COUNT);
    const driftAmp = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      seed[i] = Math.random();
      baseX[i] = (Math.random() - 0.5) * HALF_RANGE * 2;
      baseZ[i] = (Math.random() - 0.5) * HALF_RANGE * 2;
      fallSpeed[i] = 0.5 + Math.random() * 1.5;
      driftAmp[i] = 0.05 + Math.random() * 0.25;
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    g.setAttribute('aBaseX', new THREE.Float32BufferAttribute(baseX, 1));
    g.setAttribute('aBaseZ', new THREE.Float32BufferAttribute(baseZ, 1));
    g.setAttribute('aFallSpeed', new THREE.Float32BufferAttribute(fallSpeed, 1));
    g.setAttribute('aDriftAmp', new THREE.Float32BufferAttribute(driftAmp, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), HALF_RANGE * 4);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOrigin: { value: new THREE.Vector3() },
          uHalfRange: { value: HALF_RANGE },
          uHeight: { value: HEIGHT },
          uPointSize: { value: 0.08 },
          uScale: { value: 1 },
          uOpacity: { value: 0.85 },
        },
        vertexShader: GPU_VERT,
        fragmentShader: GPU_FRAG,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const parent = points.parent;
    if (parent && !parent.visible) return;
    const u = matRef.current.uniforms;
    u['uTime'].value = state.clock.elapsedTime;
    (u['uOrigin'].value as THREE.Vector3).copy(state.camera.position);
    u['uScale'].value = state.gl.domElement.height * 0.5;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      frustumCulled={false}
    >
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}

export function Snow({ gpu }: SnowProps = {}) {
  if (gpu) {
    return <GpuSnow />;
  }
  return <CpuSnow />;
}

function CpuSnow() {
  const pointsRef = useRef<THREE.Points>(null!);
  const posRef = useRef(new Float32Array(COUNT * 3));
  const velRef = useRef(new Float32Array(COUNT * 3));
  const wasmRef = useRef<GaesupCoreWasmExports | null>(null);
  const ptrsRef = useRef<{ p: number; v: number; b: number } | null>(null);
  const bounds = useMemo(() => new Float32Array(6), []);
  const frameRef = useRef(0);

  useEffect(() => {
    const pos = posRef.current;
    const vel = velRef.current;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * HALF_RANGE * 2;
      pos[i * 3 + 1] = Math.random() * HEIGHT;
      pos[i * 3 + 2] = (Math.random() - 0.5) * HALF_RANGE * 2;
      vel[i * 3] = 0;
      vel[i * 3 + 1] = -(0.5 + Math.random() * 1.5);
      vel[i * 3 + 2] = 0;
    }

    let posPtr = 0, velPtr = 0, boundsPtr = 0;
    loadCoreWasm().then((w) => {
      if (!w) return;
      wasmRef.current = w;
      const n = COUNT * 3;
      posPtr = w.alloc_f32(n);
      velPtr = w.alloc_f32(n);
      boundsPtr = w.alloc_f32(6);
      new Float32Array(w.memory.buffer, posPtr, n).set(pos);
      new Float32Array(w.memory.buffer, velPtr, n).set(vel);
      ptrsRef.current = { p: posPtr, v: velPtr, b: boundsPtr };
    });

    return () => {
      const w = wasmRef.current;
      if (!w) return;
      if (posPtr) w.dealloc_f32(posPtr, COUNT * 3);
      if (velPtr) w.dealloc_f32(velPtr, COUNT * 3);
      if (boundsPtr) w.dealloc_f32(boundsPtr, 6);
    };
  }, []);

  useFrame((state, delta) => {
    const parent = pointsRef.current?.parent;
    if (parent && !parent.visible) return;

    const cam = state.camera.position;
    bounds[0] = cam.x - HALF_RANGE;
    bounds[1] = cam.x + HALF_RANGE;
    bounds[2] = cam.y - 5;
    bounds[3] = cam.y + HEIGHT;
    bounds[4] = cam.z - HALF_RANGE;
    bounds[5] = cam.z + HALF_RANGE;

    const dt = Math.min(delta, 0.05);
    const wasm = wasmRef.current;
    const ptrs = ptrsRef.current;
    const pos = posRef.current;
    const vel = velRef.current;
    const frame = frameRef.current++;
    const isFullUpdate = frame % LOD_INTERVAL === 0;

    if (wasm && ptrs) {
      new Float32Array(wasm.memory.buffer, ptrs.b, 6).set(bounds);
      wasm.update_snow_particles(
        COUNT, ptrs.p, ptrs.v, ptrs.b,
        0.3, 0.0, 0.0,
        2.0, 0.01, dt,
      );
      // WASM 메모리를 직접 참조하여 geometry attribute 갱신 (전체 복사 제거)
      const wasmPos = new Float32Array(wasm.memory.buffer, ptrs.p, COUNT * 3);
      const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      (attr as unknown as { array: Float32Array }).array = wasmPos;
      attr.needsUpdate = true;
    } else {
      const updateEnd = isFullUpdate ? COUNT : NEAR_COUNT;
      for (let i = 0; i < updateEnd; i++) {
        const idx = i * 3;
        vel[idx] = vel[idx] * 0.99 + 0.3 * dt;
        vel[idx + 1] -= 2.0 * dt;
        vel[idx + 2] *= 0.99;

        pos[idx] += vel[idx] * dt;
        pos[idx + 1] += vel[idx + 1] * dt;
        pos[idx + 2] += vel[idx + 2] * dt;

        if (pos[idx] < bounds[0]) pos[idx] += HALF_RANGE * 2;
        else if (pos[idx] > bounds[1]) pos[idx] -= HALF_RANGE * 2;

        if (pos[idx + 1] < bounds[2]) {
          pos[idx + 1] = bounds[3];
          vel[idx + 1] = -(0.5 + Math.random() * 1.5);
        }

        if (pos[idx + 2] < bounds[4]) pos[idx + 2] += HALF_RANGE * 2;
        else if (pos[idx + 2] > bounds[5]) pos[idx + 2] -= HALF_RANGE * 2;
      }

      const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const attr = new THREE.Float32BufferAttribute(posRef.current, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', attr);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.08,
        map: getSnowTexture(),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}

export default React.memo(Snow);
