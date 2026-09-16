import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  FogExp2,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  Vector3,
  WebGPUCoordinateSystem,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGPURenderer } from 'three/webgpu';

import type { GpuDrivenInstances } from 'gaesup-world/next';
import {
  createGpuDrivenInstances,
  cullAndCompactSpheres,
  extractFrustumPlanes,
  TaskGraph,
} from 'gaesup-world/next';

import { createForest } from './forest';
import type { EngineSettings, EngineStats } from './types';

export async function mountEngine(
  canvas: HTMLCanvasElement,
  initial: EngineSettings,
  onStats: (stats: EngineStats) => void,
  signal: AbortSignal,
) {
  const renderer = new WebGPURenderer({ canvas, antialias: true });
  try {
    await renderer.init();
  } catch (error) {
    (renderer.backend as unknown as { dispose(): void }).dispose();
    throw error;
  }
  if (signal.aborted) {
    renderer.dispose();
    return null;
  }
  const native = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend === true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new Scene();
  scene.background = new Color('#b9d6d0');
  scene.fog = new FogExp2('#b9d6d0', 0.0028);
  const camera = new PerspectiveCamera(48, 1, 0.2, 1200);
  camera.position.set(70, 65, 92);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 15;
  controls.maxDistance = 700;
  controls.autoRotateSpeed = 0.4;
  const sun = new DirectionalLight('#fff2d8', 3);
  sun.position.set(40, 90, 25);
  scene.add(sun, new AmbientLight('#c6e6e2', 2));
  const owned: Mesh[] = [];
  function add(
    geometry: BoxGeometry | CylinderGeometry | TorusGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    parent: Scene | Group = scene,
  ) {
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.8 }));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    owned.push(mesh);
    return mesh;
  }
  add(new CylinderGeometry(390, 400, 9, 96), '#386e5b', 0, -7, 0);
  add(new CylinderGeometry(21, 23, 1, 64), '#c6bda0', 0, -0.2, 0);
  add(new CylinderGeometry(16, 16, 0.3, 64), '#76bdc2', 0, 0.45, 0);
  add(new CylinderGeometry(7, 8, 1.8, 8), '#769b78', 0, 1.2, 0);
  add(new BoxGeometry(3, 2, 3), '#e6d7b3', 0, 3, 0);
  const portal = add(new TorusGeometry(4.2, 0.4, 8, 48), '#ffbf79', 0, 7.5, 0);
  (portal.material as MeshStandardMaterial).emissive.set('#f29b42');
  (portal.material as MeshStandardMaterial).emissiveIntensity = 0.7;
  const bridge = add(new BoxGeometry(4, 0.7, 28), '#d2b58b', 0, 1.1, 20);
  bridge.rotation.y = -0.2;
  for (let i = 0; i < 12; i += 1) {
    const angle = (i * Math.PI) / 6;
    add(
      new CylinderGeometry(0.6, 0.9, 3, 6),
      '#e4cc9e',
      Math.sin(angle) * 19,
      1.5,
      Math.cos(angle) * 19,
    );
  }
  const { world, geometry, radius } = createForest(initial.count);
  const cpu = new InstancedMesh(
    geometry,
    new MeshStandardMaterial({ color: '#64a88e', roughness: 0.9 }),
    initial.count,
  );
  cpu.instanceMatrix.setUsage(DynamicDrawUsage);
  cpu.frustumCulled = false;
  scene.add(cpu);
  let gpu: GpuDrivenInstances | null = null;
  try {
    gpu = native
      ? await createGpuDrivenInstances({
          renderer,
          geometry,
          positions: world.transforms.positions,
          radius,
          color: 0x64a88e,
        })
      : null;
  } catch (error) {
    controls.dispose();
    geometry.dispose();
    cpu.material.dispose();
    for (const mesh of owned) {
      mesh.geometry.dispose();
      (mesh.material as MeshStandardMaterial).dispose();
    }
    renderer.dispose();
    throw error;
  }
  if (gpu) scene.add(gpu.mesh);
  const planes = new Float32Array(24);
  const viewProjection = new Matrix4();
  const projectionArray = new Float32Array(16);
  const indices = new Uint32Array(initial.count);
  const matrix = new Matrix4();
  const previousView = new Matrix4();
  let settings = initial;
  let dirty = true;
  let visible = initial.count;
  let hasVisibleCount = false;
  let cullMs = 0;
  let lastStats = 0;
  let lastFrame = 0;
  let frameSum = 0;
  let frames = 0;
  let readPending = false;
  let disposed = false;
  let generation = 0;
  let previousCpuMode = '';
  const resize = new ResizeObserver(() => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty = true;
  });
  resize.observe(canvas);
  const tasks = new TaskGraph();
  tasks.add({
    id: 'camera',
    phase: 'input',
    run: (delta) => {
      controls.autoRotate = settings.orbit;
      controls.update(delta);
      camera.updateMatrixWorld();
    },
  });
  tasks.add({
    id: 'portal',
    phase: 'simulate',
    run: (delta) => {
      portal.rotation.y += delta * 0.25;
    },
  });
  tasks.add({
    id: 'visibility',
    phase: 'render',
    run: () => {
      viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      if (!dirty && previousView.equals(viewProjection)) return;
      previousView.copy(viewProjection);
      dirty = false;
      projectionArray.set(viewProjection.elements);
      extractFrustumPlanes(
        projectionArray,
        planes,
        camera.coordinateSystem === WebGPUCoordinateSystem,
      );
      const start = performance.now();
      const mode = settings.mode === 'gpu' && !gpu ? 'cpu' : settings.mode;
      cpu.visible = mode !== 'gpu';
      if (gpu) gpu.mesh.visible = mode === 'gpu';
      if (mode === 'gpu' && gpu) gpu.update(planes);
      else {
        visible =
          mode === 'cpu'
            ? cullAndCompactSpheres(
                planes,
                world.transforms.positions,
                radius,
                initial.count,
                indices,
              )
            : initial.count;
        hasVisibleCount = true;
        const upload = mode !== 'all' || previousCpuMode !== 'all';
        for (let i = 0; upload && i < visible; i += 1) {
          const offset = (mode === 'cpu' ? (indices[i] ?? 0) : i) * 3;
          matrix.makeTranslation(
            world.transforms.positions[offset] ?? 0,
            world.transforms.positions[offset + 1] ?? 0,
            world.transforms.positions[offset + 2] ?? 0,
          );
          cpu.setMatrixAt(i, matrix);
        }
        cpu.count = visible;
        if (upload) {
          cpu.instanceMatrix.clearUpdateRanges();
          if (visible > 0) cpu.instanceMatrix.addUpdateRange(0, visible * 16);
          cpu.instanceMatrix.needsUpdate = true;
        }
        previousCpuMode = mode;
      }
      cullMs = performance.now() - start;
    },
  });
  tasks.add({
    id: 'draw',
    phase: 'render',
    deps: ['visibility'],
    run: () => {
      renderer.render(scene, camera);
    },
  });
  tasks.compile();
  function update(next: EngineSettings) {
    if (next.view !== settings.view) {
      const target =
        next.view === 'trail'
          ? new Vector3(18, 11, 34)
          : next.view === 'sky'
            ? new Vector3(160, 260, 200)
            : new Vector3(70, 65, 92);
      camera.position.copy(target);
      controls.target.set(0, 5, 0);
    }
    generation += 1;
    settings = next;
    dirty = true;
    const sky = next.sunset ? '#d5b4a3' : '#b9d6d0';
    scene.background = new Color(sky);
    (scene.fog as FogExp2).color.set(sky);
    sun.color.set(next.sunset ? '#ffac70' : '#fff2d8');
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    resize.disconnect();
    controls.dispose();
    gpu?.dispose();
    cpu.dispose();
    geometry.dispose();
    cpu.material.dispose();
    for (const mesh of owned) {
      mesh.geometry.dispose();
      (mesh.material as MeshStandardMaterial).dispose();
    }
    renderer.dispose();
  }
  if (signal.aborted) {
    dispose();
    return null;
  }
  signal.addEventListener('abort', dispose, { once: true });
  update(initial);
  renderer.setAnimationLoop((time) => {
    if (disposed) return;
    const delta = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
    if (lastFrame) {
      frameSum += time - lastFrame;
      frames += 1;
    }
    lastFrame = time;
    tasks.run(delta);
    if (time - lastStats > 750) {
      lastStats = time;
      if (gpu && settings.mode === 'gpu' && !readPending) {
        readPending = true;
        const currentGeneration = generation;
        void gpu
          .readVisibleCount()
          .then((count) => {
            if (!disposed && generation === currentGeneration) {
              visible = count;
              hasVisibleCount = true;
            }
          })
          .catch(() => {
            /* A readback can be cancelled by renderer disposal. */
          })
          .finally(() => {
            readPending = false;
          });
      }
      if (hasVisibleCount && frames > 0)
        onStats({
          backend: native ? 'Native WebGPU' : 'WebGL2 compatibility',
          visible,
          total: world.entityCount,
          frameMs: frames ? frameSum / frames : 0,
          cullMs,
          drawCalls: renderer.info.render.drawCalls,
          mode: settings.mode === 'gpu' && !gpu ? 'cpu' : settings.mode,
        });
      frameSum = 0;
      frames = 0;
    }
  });
  return { update, dispose };
}
