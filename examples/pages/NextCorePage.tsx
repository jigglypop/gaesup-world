import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import {
  compactVisible,
  cullSpheres,
  entityIndexOf,
  extractFrustumPlanes,
  FRUSTUM_PLANES_LENGTH,
  isWebGpuAvailable,
  MATRIX_STRIDE,
  NextWorld,
  packInstanceMatrices,
} from 'gaesup-world/next';

const INSTANCE_COUNT = 10000;
const FIELD_RADIUS = 120;
const FIELD_HEIGHT = 10;
const SPHERE_RADIUS = 1.2;
const STATS_INTERVAL_MS = 250;

type CullStats = {
  visible: number;
  total: number;
  cullMs: number;
};

function createScatteredWorld(): NextWorld {
  const world = new NextWorld({ capacity: INSTANCE_COUNT });
  for (let slot = 0; slot < INSTANCE_COUNT; slot += 1) {
    const index = entityIndexOf(world.createEntity());
    world.transforms.setPosition(
      index,
      (Math.random() * 2 - 1) * FIELD_RADIUS,
      Math.random() * FIELD_HEIGHT,
      (Math.random() * 2 - 1) * FIELD_RADIUS,
    );
  }
  return world;
}

function CulledInstances({ onStats }: { onStats: (stats: CullStats) => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const world = useMemo(createScatteredWorld, []);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshNormalMaterial(), []);
  const buffers = useMemo(
    () => ({
      viewProjection: new Float32Array(16),
      planes: new Float32Array(FRUSTUM_PLANES_LENGTH),
      visibility: new Uint8Array(INSTANCE_COUNT),
      indices: new Uint32Array(INSTANCE_COUNT),
      matrices: new Float32Array(INSTANCE_COUNT * MATRIX_STRIDE),
      tempMatrix: new THREE.Matrix4(),
      lastStatsAt: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ camera, clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const startedAt = performance.now();
    buffers.tempMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    buffers.viewProjection.set(buffers.tempMatrix.elements);
    extractFrustumPlanes(buffers.viewProjection, buffers.planes);
    cullSpheres(
      buffers.planes,
      world.transforms.positions,
      SPHERE_RADIUS,
      world.entityCount,
      buffers.visibility,
    );
    const visibleCount = compactVisible(buffers.visibility, world.entityCount, buffers.indices);
    packInstanceMatrices(world.transforms, buffers.indices, visibleCount, buffers.matrices);
    const instanceArray = mesh.instanceMatrix.array as Float32Array;
    instanceArray.set(buffers.matrices.subarray(0, visibleCount * MATRIX_STRIDE));
    mesh.count = visibleCount;
    mesh.instanceMatrix.needsUpdate = true;
    const cullMs = performance.now() - startedAt;
    const nowMs = clock.elapsedTime * 1000;
    if (nowMs - buffers.lastStatsAt.value >= STATS_INTERVAL_MS) {
      buffers.lastStatsAt.value = nowMs;
      onStats({ visible: visibleCount, total: world.entityCount, cullMs });
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, INSTANCE_COUNT]}
      frustumCulled={false}
    />
  );
}

export function NextCorePage() {
  const [stats, setStats] = useState<CullStats>({ visible: 0, total: INSTANCE_COUNT, cullMs: 0 });
  const backendLabel = useMemo(
    () => (isWebGpuAvailable() ? 'WebGPU available' : 'WebGPU unavailable (WebGL fallback)'),
    [],
  );
  const handleStats = useCallback((next: CullStats) => setStats(next), []);
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas camera={{ position: [0, 24, 70], fov: 60 }}>
        <CulledInstances onStats={handleStats} />
        <OrbitControls />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 16,
          padding: '10px 14px',
          background: 'rgba(10, 12, 20, 0.72)',
          color: '#e8ecf8',
          fontFamily: 'monospace',
          fontSize: 13,
          borderRadius: 8,
          pointerEvents: 'none',
        }}
      >
        <div>gaesup-world/next N1 CPU reference</div>
        <div>{backendLabel}</div>
        <div>
          visible {stats.visible} / {stats.total}
        </div>
        <div>cull+pack {stats.cullMs.toFixed(2)} ms</div>
      </div>
    </div>
  );
}
