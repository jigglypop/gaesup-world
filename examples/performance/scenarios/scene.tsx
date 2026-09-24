import { useEffect, useRef, type ReactNode } from 'react';

import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Group, InstancedMesh, Mesh, Object3D } from 'three';
import type { WebGPURenderer } from 'three/webgpu';

import { readRendererStats, createRenderer, createLegacyRenderer, type RendererStats } from 'gaesup-world';
import { GpuBatchBridge } from 'gaesup-world/building';

import { checkAbort, type ScenarioContext } from './types';

export type FrameSample = { intervalMs: number; submitMs: number; stats: RendererStats };
type FrameWaiter = { resolve: (frame: FrameSample) => void; reject: (error: Error) => void };

export async function mountScene(ctx: ScenarioContext, objects: Object3D[], batch = false, children?: ReactNode) {
  checkAbort(ctx.signal);
  const container = document.createElement('div');
  container.style.width = `${ctx.config.width}px`;
  container.style.height = `${ctx.config.height}px`;
  ctx.host.append(container);
  const root = createRoot(container);
  const waiters = new Set<FrameWaiter>();
  let rootState: RootState | null = null;
  let stopped = false;
  let observedDraws = 0;
  let observedTriangles = 0;
  let observesDraws = false;
  const gpuSamples: Array<{ at: number; ms: number }> = [];
  let gpuPending: Promise<void> | null = null;
  let collectGpu = true;
  let gpuTimingSupported = false;
  let gpuTimingError: string | null = null;
  let ready: (state: RootState) => void = () => undefined;
  const readyPromise = new Promise<RootState>((resolve) => { ready = resolve; });
  function Driver() {
    const state = useThree();
    const group = useRef<Group>(null);
    const previous = useRef(0);
    useEffect(() => {
      const autoReset = state.gl.info.autoReset;
      state.gl.info.autoReset = false;
      rootState = state;
      const backend = state.gl as unknown as {
        backend?: { isWebGPUBackend?: boolean; device?: { adapterInfo?: { vendor?: string; architecture?: string; device?: string; description?: string; isFallbackAdapter?: boolean } } };
        getContext?: () => WebGLRenderingContext;
      };
      const info = backend.backend?.device?.adapterInfo;
      let adapter: string | null = info ? [info.vendor, info.architecture, info.device, info.description].filter(Boolean).join(' / ') : null;
      if (!backend.backend && backend.getContext) {
        const gl = backend.getContext();
        const debug = gl.getExtension('WEBGL_debug_renderer_info');
        if (debug) adapter = String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
      }
      ctx.environment({
        backend: backend.backend?.isWebGPUBackend ? 'webgpu' : 'webgl', adapter,
        gpuClass: info?.isFallbackAdapter || /swiftshader|llvmpipe|software/i.test(adapter ?? '') ? 'software' : adapter ? 'hardware' : 'unknown',
      });
      const common = state.gl as unknown as WebGPURenderer;
      gpuTimingSupported = !!(common.backend as unknown as { trackTimestamp?: boolean })?.trackTimestamp;
      const previousRender = !batch && typeof common.getRenderObjectFunction === 'function' ? common.getRenderObjectFunction() : undefined;
      if (previousRender !== undefined) {
        observesDraws = true;
        const forward = previousRender ?? common.renderObject.bind(common);
        common.setRenderObjectFunction((...args) => {
          const [object, , , geometry, , group] = args;
          observedDraws++;
          if ((object as Mesh).isMesh) {
            const available = geometry.index?.count ?? geometry.getAttribute('position').count;
            const start = Math.max(geometry.drawRange.start, group?.start ?? 0);
            const end = Math.min(available, geometry.drawRange.start + geometry.drawRange.count, group ? group.start + group.count : Infinity);
            const count = (object as InstancedMesh).isInstancedMesh ? (object as InstancedMesh).count : 1;
            observedTriangles += Math.max(0, end - start) / 3 * count;
          }
          forward(...args);
        });
      }
      ready(state);
      return () => {
        state.gl.info.autoReset = autoReset;
        if (previousRender !== undefined) common.setRenderObjectFunction(previousRender);
      };
    }, [state]);
    useFrame((state) => {
      const now = performance.now();
      const intervalMs = previous.current ? now - previous.current : 0;
      previous.current = now;
      state.gl.info.reset();
      observedDraws = 0; observedTriangles = 0;
      const start = performance.now();
      state.gl.render(state.scene, state.camera);
      const frame = { intervalMs, submitMs: performance.now() - start, stats: readRendererStats(state.gl.info) };
      if (gpuTimingSupported && collectGpu && !gpuPending) {
        const timed = state.gl as unknown as { resolveTimestampsAsync(type: string): Promise<number | undefined> };
        gpuPending = timed.resolveTimestampsAsync('render').then((ms) => {
          if (typeof ms === 'number' && Number.isFinite(ms) && ms >= 0) gpuSamples.push({ at: now, ms });
        }).catch((error: unknown) => { gpuTimingError = String(error); }).finally(() => { gpuPending = null; });
      }
      for (const waiter of waiters) waiter.resolve(frame);
      waiters.clear();
    }, 1);
    return <>
      <color attach="background" args={['#102126']} />
      <ambientLight intensity={2} />
      <directionalLight position={[8, 12, 10]} intensity={3} />
      <group ref={group}>{objects.map((object) => <primitive key={object.uuid} object={object} />)}</group>
      {batch && <GpuBatchBridge root={group} />}
    </>;
  }
  root.render(<Canvas
    onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    gl={ctx.config.backend === 'webgpu' ? (props) => {
      const options = { ...props, trackTimestamp: true };
      return createRenderer(options);
    } : createLegacyRenderer}
    dpr={ctx.config.dpr} camera={{ position: [10, 10, 18], near: 0.1, far: 500, fov: 50 }}
  ><Driver />{children}</Canvas>);
  function dispose() {
    if (stopped) return;
    stopped = true;
    let capture: string | null = null;
    if (rootState && !ctx.signal.aborted) {
      try { capture = rootState.gl.domElement.toDataURL('image/png'); }
      catch { /* Capture may be unavailable; metrics remain independent of capture. */ }
    }
    for (const waiter of waiters) waiter.reject(new Error('Scene disposed'));
    waiters.clear();
    flushSync(() => root.unmount());
    // This scene owns its renderer; R3F may defer its own disposal.
    rootState?.gl.dispose();
    container.remove();
    if (capture) {
      const image = document.createElement('img');
      image.src = capture;
      image.alt = '재현 장면의 마지막 프레임';
      image.className = 'lab-capture';
      ctx.host.append(image);
    }
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const abortReady = new Promise<never>((_, reject) => {
    const abort = () => reject(new DOMException('실행 중지', 'AbortError'));
    ctx.signal.addEventListener('abort', abort, { once: true });
    void readyPromise.then(() => ctx.signal.removeEventListener('abort', abort));
    timeout = setTimeout(() => { ctx.signal.removeEventListener('abort', abort); reject(new Error('Renderer initialization timed out')); }, 20000);
  });
  let state: RootState;
  try { state = await Promise.race([readyPromise, abortReady]); }
  catch (error) { dispose(); throw error; }
  finally { clearTimeout(timeout); }
  return {
    state,
    gpuTiming: async () => {
      collectGpu = false;
      await gpuPending;
      return { supported: gpuTimingSupported, error: gpuTimingError, samples: gpuSamples };
    },
    referenceCounts: () => observesDraws ? { draws: observedDraws, triangles: observedTriangles } : null,
    frame: () => new Promise<FrameSample>((resolve, reject) => {
      checkAbort(ctx.signal);
      if (stopped) { reject(new Error('Scene disposed')); return; }
      const timer = setTimeout(() => { waiters.delete(waiter); reject(new Error('Render frame timed out')); }, 10000);
      const abort = () => { clearTimeout(timer); waiters.delete(waiter); reject(new DOMException('실행 중지', 'AbortError')); };
      const waiter: FrameWaiter = {
        resolve: (value) => { clearTimeout(timer); ctx.signal.removeEventListener('abort', abort); resolve(value); },
        reject: (error) => { clearTimeout(timer); ctx.signal.removeEventListener('abort', abort); reject(error); },
      };
      ctx.signal.addEventListener('abort', abort, { once: true });
      waiters.add(waiter);
    }),
    dispose,
  };
}
