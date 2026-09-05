import React, { useEffect, useMemo, useRef, useState } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSearchParams } from 'react-router-dom';
import * as THREE from 'three';

import { logger } from 'gaesup-world';
import {
  compactVisible,
  createGpuCulledInstances,
  createThreeWebGpuBackend,
  cullSpheres,
  entityIndexOf,
  extractFrustumPlanes,
  FRUSTUM_PLANES_LENGTH,
  isWebGpuAvailable,
  MATRIX_STRIDE,
  NextWorld,
  packInstanceMatrices,
  type GpuCulledInstancesResult,
  type RendererBackend,
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
const FPS_SAMPLE_SECONDS = 0.5;
const SCENE_SEED = 42;
const RANDOM_MULTIPLIER = 1664525;
const RANDOM_INCREMENT = 1013904223;
const UINT32_RANGE = 0x100000000;
const CAMERA_CONFIG = { position: [0, 24, 70] as [number, number, number], fov: 60 };

type CullStats = {
  visible: number;
  total: number;
  cullMs: number;
  fps: number;
  backend?: 'webgpu' | 'webgl2' | 'unavailable';
};

type CullStatsRef = React.MutableRefObject<CullStats>;

function createFpsSampler() {
  let elapsed = 0;
  let frames = 0;
  let fps = 0;
  return (delta: number) => {
    if (delta <= 0) return fps;
    elapsed += delta;
    frames += 1;
    if (elapsed >= FPS_SAMPLE_SECONDS) {
      fps = frames / elapsed;
      elapsed = 0;
      frames = 0;
    }
    return fps;
  };
}

function createScatteredWorld(count = INSTANCE_COUNT, radius = FIELD_RADIUS, height = FIELD_HEIGHT): NextWorld {
  let seed = SCENE_SEED;
  const random = () => {
    seed = (Math.imul(seed, RANDOM_MULTIPLIER) + RANDOM_INCREMENT) >>> 0;
    return seed / UINT32_RANGE;
  };
  const world = new NextWorld({ capacity: count });
  for (let slot = 0; slot < count; slot += 1) {
    const index = entityIndexOf(world.createEntity());
    world.transforms.setPosition(
      index,
      (random() * 2 - 1) * radius,
      random() * height,
      (random() * 2 - 1) * radius,
    );
  }
  return world;
}

function CulledInstances({ statsRef }: { statsRef: CullStatsRef }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const world = useMemo(createScatteredWorld, []);
  const sampleFps = useMemo(createFpsSampler, []);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshNormalMaterial(), []);
  const buffers = useMemo(
    () => ({
      viewProjection: new Float32Array(16),
      planes: new Float32Array(FRUSTUM_PLANES_LENGTH),
      visibility: new Uint8Array(INSTANCE_COUNT),
      indices: new Uint32Array(INSTANCE_COUNT),
      tempMatrix: new THREE.Matrix4(),
      previousViewProjection: new Float64Array(16),
      updateRange: { start: 0, count: 0 },
    }),
    [],
  );

  useEffect(() => {
    meshRef.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const stats = statsRef.current;
    stats.fps = sampleFps(delta);
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
    extractFrustumPlanes(buffers.viewProjection, buffers.planes, camera.coordinateSystem === THREE.WebGPUCoordinateSystem || camera.reversedDepth);
    cullSpheres(
      buffers.planes,
      world.transforms.positions,
      SPHERE_RADIUS,
      world.entityCount,
      buffers.visibility,
    );
    const visibleCount = compactVisible(buffers.visibility, world.entityCount, buffers.indices);
    const instanceArray = mesh.instanceMatrix.array as Float32Array;
    packInstanceMatrices(world.transforms, buffers.indices, visibleCount, instanceArray);
    mesh.count = visibleCount;
    mesh.instanceMatrix.clearUpdateRanges();
    if (visibleCount > 0) {
      buffers.updateRange.count = visibleCount * MATRIX_STRIDE;
      mesh.instanceMatrix.updateRanges.push(buffers.updateRange);
      mesh.instanceMatrix.needsUpdate = true;
    }
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
  coordinateSystem?: THREE.CoordinateSystem;
  backend?: { isWebGPUBackend?: boolean };
  setPixelRatio(ratio: number): void;
  setAnimationLoop(callback: (() => void) | null): Promise<void>;
  compute(node: unknown): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
};

function reportGpuSceneError(message: string, error: unknown): void {
  try {
    logger.error(`[NextCorePage] ${message}`, error instanceof Error ? error : String(error));
  } catch {
    // Logging must not interrupt the remaining resource cleanup attempts.
  }
}

function GpuScene({ statsRef, autoRotate }: { statsRef: CullStatsRef; autoRotate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    let cancelled = false;
    statsRef.current = { visible: 0, total: GPU_INSTANCE_COUNT, cullMs: 0, fps: 0 };
    let culledOwner: GpuCulledInstancesResult | null = null;
    let backendOwner: RendererBackend | null = null;
    let geometryOwner: THREE.BoxGeometry | null = null;
    let loopOwner: WebGpuRendererInstance | null = null;
    let resizeOwner: (() => void) | null = null;

    const releaseOwned = (): void => {
      cancelled = true;
      const loop = loopOwner;
      const geometry = geometryOwner;
      const culled = culledOwner;
      const backend = backendOwner;
      const resize = resizeOwner;
      resizeOwner = null;
      loopOwner = null;
      geometryOwner = null;
      culledOwner = null;
      backendOwner = null;

      if (resize) window.removeEventListener('resize', resize);

      if (loop) {
        try {
          void loop.setAnimationLoop(null).catch((error: unknown) => {
            reportGpuSceneError('GPU animation loop cleanup failed.', error);
          });
        } catch (error) {
          reportGpuSceneError('GPU animation loop cleanup failed.', error);
        }
      }
      if (geometry) {
        try {
          geometry.dispose();
        } catch (error) {
          reportGpuSceneError('GPU geometry cleanup failed.', error);
        }
      }
      if (culled) {
        try {
          culled.dispose();
        } catch (error) {
          reportGpuSceneError('GPU culling cleanup failed.', error);
        }
      }
      if (backend) {
        try {
          backend.dispose();
        } catch (error) {
          reportGpuSceneError('GPU backend cleanup failed.', error);
        }
      }
    };

    const setup = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const world = createScatteredWorld(GPU_INSTANCE_COUNT, GPU_FIELD_RADIUS, GPU_FIELD_HEIGHT);
      culledOwner = await createGpuCulledInstances({
        count: GPU_INSTANCE_COUNT,
        positions: world.transforms.positions,
        radius: SPHERE_RADIUS,
        createPlaneVector: () => new THREE.Vector4(),
      });
      if (!culledOwner || cancelled) {
        if (!cancelled) statsRef.current.backend = 'unavailable';
        releaseOwned();
        return;
      }
      const culled = culledOwner;
      try {
        backendOwner = await createThreeWebGpuBackend({
          canvas,
          width: Math.max(1, canvas.clientWidth),
          height: Math.max(1, canvas.clientHeight),
        });
      } finally {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
      if (!backendOwner || cancelled) {
        if (!cancelled) statsRef.current.backend = 'unavailable';
        releaseOwned();
        return;
      }
      const backend = backendOwner;
      const renderer = backend.native as WebGpuRendererInstance;
      statsRef.current.backend = renderer.backend?.isWebGPUBackend ? 'webgpu' : 'webgl2';
      let pixelRatio = window.devicePixelRatio;
      renderer.setPixelRatio(pixelRatio);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0b0e1a');
      const camera = new THREE.PerspectiveCamera(
        60,
        Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight),
        0.1,
        2000,
      );
      camera.coordinateSystem = renderer.coordinateSystem ?? camera.coordinateSystem;
      camera.updateProjectionMatrix();
      geometryOwner = new THREE.BoxGeometry(1, 1, 1);
      if (cancelled) {
        releaseOwned();
        return;
      }
      const geometry = geometryOwner;
      const mesh = new THREE.InstancedMesh(
        geometry,
        culled.material as unknown as THREE.Material,
        GPU_INSTANCE_COUNT,
      );
      mesh.frustumCulled = false;
      const allIndices = new Uint32Array(GPU_INSTANCE_COUNT);
      for (let slot = 0; slot < GPU_INSTANCE_COUNT; slot += 1) allIndices[slot] = slot;
      packInstanceMatrices(
        world.transforms,
        allIndices,
        GPU_INSTANCE_COUNT,
        mesh.instanceMatrix.array as Float32Array,
      );
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      let needsCulling = true;
      const handleResize = () => {
        if (cancelled) return;
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        try {
          if (pixelRatio !== window.devicePixelRatio) {
            pixelRatio = window.devicePixelRatio;
            renderer.setPixelRatio(pixelRatio);
          }
          backend.resize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          needsCulling = true;
        } catch (error) {
          statsRef.current.backend = 'unavailable';
          releaseOwned();
          reportGpuSceneError('GPU viewport resize failed.', error);
        } finally {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      };
      resizeOwner = handleResize;
      window.addEventListener('resize', handleResize);
      handleResize();
      if (cancelled) return;
      const viewProjection = new Float32Array(16);
      const planes = new Float32Array(FRUSTUM_PLANES_LENGTH);
      const tempMatrix = new THREE.Matrix4();
      let angle = 0;
      let last: number | undefined;
      const sampleFps = createFpsSampler();
      loopOwner = renderer;
      const loopPromise = renderer.setAnimationLoop(() => {
        if (cancelled) return;
        try {
          const now = performance.now();
          const delta = last === undefined ? 0 : (now - last) / 1000;
          last = now;
          const stats = statsRef.current;
          stats.fps = sampleFps(delta);
          if (autoRotateRef.current && delta > 0) {
            angle += delta * GPU_ORBIT_SPEED;
            needsCulling = true;
          }
          stats.cullMs = 0;
          if (needsCulling) {
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
            extractFrustumPlanes(viewProjection, planes, camera.coordinateSystem === THREE.WebGPUCoordinateSystem || camera.reversedDepth);
            culled.updatePlanes(planes);
            renderer.compute(culled.computeNode);
            stats.cullMs = performance.now() - startedAt;
            needsCulling = false;
          }
          stats.visible = -1;
          stats.total = GPU_INSTANCE_COUNT;
          renderer.render(scene, camera);
        } catch (error) {
          statsRef.current.backend = 'unavailable';
          statsRef.current.fps = 0;
          releaseOwned();
          reportGpuSceneError('GPU frame failed.', error);
        }
      });
      void loopPromise.catch((error: unknown) => {
        if (cancelled || loopOwner !== renderer) return;
        statsRef.current.backend = 'unavailable';
        releaseOwned();
        reportGpuSceneError('GPU animation loop failed to start.', error);
      });
    };
    void setup().catch((error: unknown) => {
      const shouldReport = !cancelled;
      if (shouldReport) statsRef.current.backend = 'unavailable';
      releaseOwned();
      if (shouldReport) reportGpuSceneError('GPU scene setup failed.', error);
    });
    return () => {
      releaseOwned();
    };
  }, [statsRef]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

const Scene = React.memo(function Scene({
  statsRef,
  autoRotate,
}: {
  statsRef: CullStatsRef;
  autoRotate: boolean;
}) {
  return (
    <Canvas camera={CAMERA_CONFIG}>
      <CulledInstances statsRef={statsRef} />
      <OrbitControls autoRotate={autoRotate} autoRotateSpeed={2} />
    </Canvas>
  );
});

function StatsOverlay({
  statsRef,
  gpuMode,
  onModeChange,
  autoRotate,
  onAutoRotateChange,
}: {
  statsRef: CullStatsRef;
  gpuMode: boolean;
  onModeChange: (gpuMode: boolean) => void;
  autoRotate: boolean;
  onAutoRotateChange: (enabled: boolean) => void;
}) {
  const [stats, setStats] = useState<CullStats>(() => ({ ...statsRef.current }));
  const backendLabel = !gpuMode
    ? 'WebGL 렌더링'
    : stats.backend === 'webgpu'
      ? 'WebGPU 렌더링'
      : stats.backend === 'webgl2'
        ? 'WebGL2 대체 렌더링'
        : stats.backend === 'unavailable'
          ? 'GPU 실행 실패 · CPU 모드로 전환하세요'
          : 'GPU 초기화 중';
  useEffect(() => {
    const timer = window.setInterval(() => setStats({ ...statsRef.current }), STATS_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [statsRef]);
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(var(--app-header-height) + 16px)',
        left: 16,
        padding: '10px 14px',
        background: 'rgba(10, 12, 20, 0.72)',
        color: '#e8ecf8',
        fontFamily: 'monospace',
        fontSize: 13,
        borderRadius: 8,
      }}
    >
      <div>성능 비교 · {gpuMode ? 'GPU 컬링' : 'CPU 컬링'}</div>
      <div>{backendLabel}</div>
      <div>
        표시 객체 {stats.visible < 0 ? 'GPU에서 관리' : stats.visible} / {stats.total}
      </div>
      <div>
        {gpuMode ? 'GPU 명령 제출' : '컬링·행렬 준비'} {stats.cullMs.toFixed(2)} ms
      </div>
      <div>초당 프레임 {stats.fps.toFixed(0)}</div>
      <p style={{ maxWidth: 'min(28rem, calc(100vw - 64px))', margin: '8px 0', lineHeight: 1.5, wordBreak: 'keep-all' }}>
        장면 배치는 고정됩니다. 두 모드는 객체 수와 측정 항목이 다릅니다.
      </p>
      <div style={{ marginTop: 6 }}>
        <button
          type="button"
          className="gp-btn"
          aria-pressed={!gpuMode}
          onClick={() => onModeChange(false)}
        >
          CPU · 1만 개
        </button>
        <button
          type="button"
          className="gp-btn"
          aria-pressed={gpuMode}
          disabled={!isWebGpuAvailable()}
          onClick={() => onModeChange(true)}
        >
          GPU · 10만 개
        </button>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(event) => onAutoRotateChange(event.target.checked)}
          />
          카메라 자동 회전
      </label>
    </div>
  );
}

export function NextCorePage() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const gpuMode = searchParams.has('gpu');
  const handleModeChange = (enabled: boolean) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (enabled) next.set('gpu', '');
      else next.delete('gpu');
      return next;
    });
  };
  const statsRef = useMemo<CullStatsRef>(() => ({
    current: { visible: 0, total: gpuMode ? GPU_INSTANCE_COUNT : INSTANCE_COUNT, cullMs: 0, fps: 0 },
  }), [gpuMode]);
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {gpuMode ? (
        <GpuScene statsRef={statsRef} autoRotate={autoRotate} />
      ) : (
        <Scene statsRef={statsRef} autoRotate={autoRotate} />
      )}
      <StatsOverlay
        key={gpuMode ? 'gpu' : 'cpu'}
        statsRef={statsRef}
        gpuMode={gpuMode}
        onModeChange={handleModeChange}
        autoRotate={autoRotate}
        onAutoRotateChange={setAutoRotate}
      />
    </div>
  );
}
