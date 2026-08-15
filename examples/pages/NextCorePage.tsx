import React, { useEffect, useMemo, useRef, useState } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import {
  compactVisible,
  createGpuCulledInstances,
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
const GPU_INSTANCE_COUNT = 100000;
const GPU_FIELD_RADIUS = 400;
const GPU_FIELD_HEIGHT = 40;
const GPU_CAMERA_RADIUS = 300;
const GPU_CAMERA_HEIGHT = 110;
const GPU_ORBIT_SPEED = 0.3;
const FIELD_RADIUS = 120;
const FIELD_HEIGHT = 10;
const SPHERE_RADIUS = 1.2;
const STATS_INTERVAL_MS = 250;
const CAMERA_CONFIG = { position: [0, 24, 70] as [number, number, number], fov: 60 };

type CullStats = {
  visible: number;
  total: number;
  cullMs: number;
  fps: number;
};

type CullStatsRef = React.MutableRefObject<CullStats>;

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

function CulledInstances({ statsRef }: { statsRef: CullStatsRef }) {
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
      previousViewProjection: new Float32Array(16),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const stats = statsRef.current;
    if (delta > 0) {
      const instantFps = 1 / delta;
      stats.fps = stats.fps === 0 ? instantFps : stats.fps * 0.9 + instantFps * 0.1;
    }
    buffers.tempMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    let cameraMoved = false;
    for (let slot = 0; slot < 16; slot += 1) {
      const element = buffers.tempMatrix.elements[slot] ?? 0;
      if (buffers.previousViewProjection[slot] !== element) {
        cameraMoved = true;
        buffers.previousViewProjection[slot] = element;
      }
    }
    if (!cameraMoved) return;
    const startedAt = performance.now();
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
    stats.visible = visibleCount;
    stats.total = world.entityCount;
    stats.cullMs = performance.now() - startedAt;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, INSTANCE_COUNT]}
      frustumCulled={false}
    />
  );
}

type WebGpuRendererInstance = {
  init(): Promise<void>;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  setPixelRatio(ratio: number): void;
  setAnimationLoop(callback: (() => void) | null): void;
  compute(node: unknown): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  dispose(): void;
};

type WebGpuRendererModule = {
  WebGPURenderer: new (parameters: {
    canvas: HTMLCanvasElement;
    antialias: boolean;
  }) => WebGpuRendererInstance;
};

function GpuScene({ statsRef }: { statsRef: CullStatsRef }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;
    const setup = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const world = new NextWorld({ capacity: GPU_INSTANCE_COUNT });
      for (let slot = 0; slot < GPU_INSTANCE_COUNT; slot += 1) {
        const index = entityIndexOf(world.createEntity());
        world.transforms.setPosition(
          index,
          (Math.random() * 2 - 1) * GPU_FIELD_RADIUS,
          Math.random() * GPU_FIELD_HEIGHT,
          (Math.random() * 2 - 1) * GPU_FIELD_RADIUS,
        );
      }
      const culled = await createGpuCulledInstances({
        count: GPU_INSTANCE_COUNT,
        positions: world.transforms.positions,
        radius: SPHERE_RADIUS,
        createPlaneVector: () => new THREE.Vector4(),
      });
      if (!culled || disposed) {
        culled?.dispose();
        return;
      }
      const webgpu = (await import('three/webgpu')) as unknown as WebGpuRendererModule;
      if (disposed) {
        culled.dispose();
        return;
      }
      const renderer = new webgpu.WebGPURenderer({ canvas, antialias: true });
      await renderer.init();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0b0e1a');
      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        2000,
      );
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const mesh = new THREE.InstancedMesh(
        geometry,
        culled.material as unknown as THREE.Material,
        GPU_INSTANCE_COUNT,
      );
      mesh.frustumCulled = false;
      const allIndices = new Uint32Array(GPU_INSTANCE_COUNT);
      for (let slot = 0; slot < GPU_INSTANCE_COUNT; slot += 1) allIndices[slot] = slot;
      const matrices = new Float32Array(GPU_INSTANCE_COUNT * MATRIX_STRIDE);
      packInstanceMatrices(world.transforms, allIndices, GPU_INSTANCE_COUNT, matrices);
      (mesh.instanceMatrix.array as Float32Array).set(matrices);
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      const viewProjection = new Float32Array(16);
      const planes = new Float32Array(FRUSTUM_PLANES_LENGTH);
      const tempMatrix = new THREE.Matrix4();
      let angle = 0;
      let last = performance.now();
      renderer.setAnimationLoop(() => {
        const now = performance.now();
        const delta = (now - last) / 1000;
        last = now;
        const stats = statsRef.current;
        if (delta > 0) {
          const instantFps = 1 / delta;
          stats.fps = stats.fps === 0 ? instantFps : stats.fps * 0.9 + instantFps * 0.1;
        }
        angle += delta * GPU_ORBIT_SPEED;
        camera.position.set(
          Math.cos(angle) * GPU_CAMERA_RADIUS,
          GPU_CAMERA_HEIGHT,
          Math.sin(angle) * GPU_CAMERA_RADIUS,
        );
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
        const startedAt = performance.now();
        tempMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        viewProjection.set(tempMatrix.elements);
        extractFrustumPlanes(viewProjection, planes);
        culled.updatePlanes(planes);
        renderer.compute(culled.computeNode);
        stats.cullMs = performance.now() - startedAt;
        stats.visible = -1;
        stats.total = GPU_INSTANCE_COUNT;
        renderer.render(scene, camera);
      });
      cleanup = () => {
        renderer.setAnimationLoop(null);
        culled.dispose();
        geometry.dispose();
        renderer.dispose();
      };
    };
    void setup();
    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [statsRef]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

const Scene = React.memo(function Scene({ statsRef }: { statsRef: CullStatsRef }) {
  return (
    <Canvas camera={CAMERA_CONFIG}>
      <CulledInstances statsRef={statsRef} />
      <OrbitControls autoRotate autoRotateSpeed={2} />
    </Canvas>
  );
});

function StatsOverlay({ statsRef, gpuMode }: { statsRef: CullStatsRef; gpuMode: boolean }) {
  const [stats, setStats] = useState<CullStats>(() => ({ ...statsRef.current }));
  const backendLabel = useMemo(
    () => (isWebGpuAvailable() ? 'WebGPU available' : 'WebGPU unavailable (WebGL fallback)'),
    [],
  );
  useEffect(() => {
    const timer = window.setInterval(() => setStats({ ...statsRef.current }), STATS_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [statsRef]);
  return (
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
      }}
    >
      <div>
        gaesup-world/next N1 {gpuMode ? 'GPU compute cull' : 'CPU reference'}
      </div>
      <div>{backendLabel}</div>
      <div>
        visible {stats.visible < 0 ? 'gpu-resident' : stats.visible} / {stats.total}
      </div>
      <div>cull{gpuMode ? '' : '+pack'} {stats.cullMs.toFixed(2)} ms</div>
      <div>fps {stats.fps.toFixed(0)}</div>
      <div style={{ marginTop: 6 }}>
        <a href="/next" style={{ color: gpuMode ? '#8fa3ff' : '#4ade80', marginRight: 10 }}>
          cpu 10k
        </a>
        <a href="/next?gpu" style={{ color: gpuMode ? '#4ade80' : '#8fa3ff' }}>
          gpu 100k
        </a>
      </div>
    </div>
  );
}

export function NextCorePage() {
  const gpuMode = useMemo(() => window.location.search.includes('gpu'), []);
  const statsRef = useRef<CullStats>({ visible: 0, total: INSTANCE_COUNT, cullMs: 0, fps: 0 });
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {gpuMode ? <GpuScene statsRef={statsRef} /> : <Scene statsRef={statsRef} />}
      <StatsOverlay statsRef={statsRef} gpuMode={gpuMode} />
    </div>
  );
}
