import React, { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { loadCoreWasm, type GaesupCoreWasmExports } from '@core/wasm/loader';

const COUNT = 2000;
const HALF_RANGE = 20;
const HEIGHT = 20;

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

export function Snow() {
  const pointsRef = useRef<THREE.Points>(null!);
  const posRef = useRef(new Float32Array(COUNT * 3));
  const velRef = useRef(new Float32Array(COUNT * 3));
  const wasmRef = useRef<GaesupCoreWasmExports | null>(null);
  const ptrsRef = useRef<{ p: number; v: number; b: number } | null>(null);
  const bounds = useMemo(() => new Float32Array(6), []);

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

    if (wasm && ptrs) {
      new Float32Array(wasm.memory.buffer, ptrs.b, 6).set(bounds);
      wasm.update_snow_particles(
        COUNT, ptrs.p, ptrs.v, ptrs.b,
        0.3, 0.0, 0.0,
        2.0, 0.01, dt,
      );
      pos.set(new Float32Array(wasm.memory.buffer, ptrs.p, COUNT * 3));
    } else {
      for (let i = 0; i < COUNT; i++) {
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
    }

    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    attr.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(posRef.current, 3));
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
