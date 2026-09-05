import React, { createElement as h, Suspense, useEffect, useRef, useState } from 'react';

import { createRoot as createFiberRoot, events, useFrame, useBridge, _roots, unmountComponentAtNode } from '@react-three/fiber';
import { FiberProvider } from 'its-fine';
import { Physics, RigidBody, CuboidCollider, BallCollider, useRapier } from '@react-three/rapier';
import { createRoot } from 'react-dom/client';
import { Scene, WebGPURenderer } from 'three/webgpu';

const probe = (window.rendererProbe = {
  frames: 0,
  height: null,
  backend: null,
  rendererCreated: 0,
  rootsCreated: 0,
  rendererDisposed: 0,
  bodyRemoved: false,
  pointerHits: 0,
  rootsRemaining: () => _roots.size,
});
let bodyHandle;
const RuntimeContext = React.createContext('missing');
async function createRenderer(props) {
  if (new URLSearchParams(window.location.search).has('fail-init')) {
    throw new Error('Injected renderer initialization failure');
  }
  const renderer = new WebGPURenderer({ ...props, antialias: true });
  await renderer.init();
  probe.rendererCreated++;
  probe.backend = renderer.backend.isWebGPUBackend
    ? 'webgpu'
    : renderer.backend.isWebGLBackend
      ? 'webgl-fallback'
      : 'unknown';
  const dispose = renderer.dispose.bind(renderer);
  let disposed = false;
  renderer.dispose = () => {
    if (disposed) return;
    disposed = true;
    probe.rendererDisposed++;
    return dispose();
  };
  return renderer;
}

function CleanupComplete({ onComplete }) {
  useEffect(onComplete, [onComplete]);
  return null;
}

function OwnedCanvas(props) {
  return h(FiberProvider, null, h(OwnedCanvasImpl, props));
}

function OwnedCanvasImpl({ children }) {
  const Bridge = useBridge();
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
  const latestChildren = useRef(null);
  latestChildren.current = h(Bridge, null, children);
  useEffect(() => {
    const host = canvasRef.current;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    host.appendChild(canvas);
    let root;
    let cancelled = false;
    let renderer;
    let cleanup;
    let store;
    const updateSize = () => {
      if (cancelled || !store) return;
      const bounds = host.getBoundingClientRect();
      store.getState().setSize(bounds.width, bounds.height, bounds.top, bounds.left);
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(host);
    probe.rootRemoved = () => !_roots.has(canvas);
    probe.releaseRenderer = () => renderer?.dispose();
    probe.resources = () => ({ ...renderer?.info.memory });
    probe.viewport = () => {
      const state = store?.getState();
      return { width: state?.size.width, height: state?.size.height, aspect: state?.camera.aspect,
        bufferWidth: canvas.width, bufferHeight: canvas.height, dpr: state?.viewport.dpr };
    };
    const configured = (async () => {
      renderer = await createRenderer({ canvas });
      if (!cancelled && new URLSearchParams(window.location.search).has('cancel-init')) {
        await new Promise(resolve => { probe.finishInitialization = resolve; });
      }
      if (cancelled) return;
      root = createFiberRoot(canvas);
      probe.rootsCreated++;
      if (new URLSearchParams(window.location.search).has('fail-configure')) {
        renderer.setSize = () => { throw new Error('Injected initialized renderer resize failure'); };
      }
      if (new URLSearchParams(window.location.search).has('fail-configure-early')) {
        renderer.hasInitialized = () => { throw new Error('Injected renderer readiness failure'); };
      }
      await root.configure({
        events,
        renderer,
        camera: { position: [8, 6, 10], fov: 45 },
        size: { width: canvas.clientWidth, height: canvas.clientHeight, top: 0, left: 0 },
      });
    })();
    const release = () => {
      cancelled = true;
      observer.disconnect();
      if (rootRef.current === root) rootRef.current = null;
      canvas.remove();
      cleanup ??= configured.catch(() => undefined).then(async () => {
        if (!root) {
          renderer?.dispose();
          return;
        }
        const rootStore = _roots.get(canvas)?.store;
        if (!rootStore) {
          renderer?.dispose();
          return;
        }
        // Alpha teardown also requires a scene when configure failed before scene creation.
        if (!rootStore.getState().scene) rootStore.setState({ scene: new Scene() });
        // Alpha teardown assumes XR setup completed even when configure rejected before it.
        if (!rootStore.getState().xr) rootStore.setState({ xr: { connect() {}, disconnect() {} } });
        if (store) await new Promise(resolve => {
          root.render(h(CleanupComplete, { onComplete: resolve }));
        });
        store?.getState().events.disconnect?.();
        await new Promise(resolve => {
          unmountComponentAtNode(canvas, () => {
            probe.disposedBeforeOwner = probe.rendererDisposed;
            renderer.dispose();
            resolve();
          });
        });
      });
      return cleanup;
    };
    probe.unmountOwned = callback => release().then(callback);
    configured.then(() => {
      if (cancelled) return;
      rootRef.current = root;
      store = root.render(latestChildren.current);
      updateSize();
    }).catch(error => {
      probe.initializationError = String(error);
      void release().catch(cleanupError => { probe.cleanupError = String(cleanupError); });
    });
    return () => { void release().catch(error => { probe.cleanupError = String(error); }); };
  }, []);
  useEffect(() => {
    rootRef.current?.render(latestChildren.current);
  }, [children, Bridge]);
  return h('div', { ref: canvasRef, style: { width: '100%', height: '100%' } });
}

function Observe({ body, included }) {
  const runtimeContext = React.useContext(RuntimeContext);
  const { world } = useRapier();
  useFrame((state, delta) => {
    probe.frames++;
    probe.runtimeContext = runtimeContext;
    probe.height = included && body.current ? body.current.translation().y : null;
    probe.bodyRemoved = bodyHandle !== undefined && !world.getRigidBody(bodyHandle);
    probe.renderCalls = state.renderer.info.render.calls;
    probe.frameIntervalTotalMs = (probe.frameIntervalTotalMs ?? 0) + delta * 1000;
    probe.frameIntervalMaxMs = Math.max(probe.frameIntervalMaxMs ?? 0, delta * 1000);
    if (probe.frames % 10 === 0)
      document.getElementById('status').textContent = JSON.stringify(probe, null, 2);
  });
  return null;
}

function App() {
  const [runtimeContext, setRuntimeContext] = useState('initial');
  const [paused, setPaused] = useState(true);
  const [included, setIncluded] = useState(true);
  const [mounted, setMounted] = useState(true);
  const body = useRef(null);
  const handleRemount = () => {
    body.current = null;
    bodyHandle = undefined;
    probe.bodyRemoved = false;
    probe.height = null;
    probe.renderCalls = 0;
    setPaused(true);
    setIncluded(true);
    setMounted(true);
  };
  useEffect(() => {
    if (!paused || !body.current) return;
    body.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }, [paused]);
  return h(
    RuntimeContext.Provider,
    { value: runtimeContext },
    h(
      'div',
      { id: 'controls' },
      h('button', { 'data-testid': 'context', onClick: () => setRuntimeContext(value => value === 'initial' ? 'updated' : 'initial') }, '런타임 설정 변경'),
      h('button', { 'data-testid': 'resume', onClick: () => setPaused(false) }, '낙하 시작'),
      h(
        'button',
        { 'data-testid': 'pause', onClick: () => setPaused(true) },
        '일시정지·높이 초기화',
      ),
      h('button', { 'data-testid': 'remove', onClick: () => setIncluded(false) }, '물리 객체 제거'),
      h(
        'button',
        {
          'data-testid': 'unmount',
          disabled: !mounted,
          onClick: () => probe.unmountOwned(() => setMounted(false)),
        },
        '장면 해제',
      ),
      h(
        'button',
        { 'data-testid': 'remount', disabled: mounted, onClick: handleRemount },
        '장면 다시 생성',
      ),
    ),
    h(
      'div',
      { id: 'scene' },
      mounted &&
        h(
          OwnedCanvas,
          null,
          h('color', { attach: 'background', args: ['#182c42'] }),
          h('ambientLight', { intensity: 1.5 }),
          h('directionalLight', { position: [3, 8, 4], intensity: 3 }),
          h(
            Suspense,
            { fallback: null },
            h(
              Physics,
              { gravity: [0, -9.81, 0], paused, timeStep: 1 / 60 },
              h(Observe, { body, included }),
              h(
                RigidBody,
                { type: 'fixed', colliders: false },
                h(CuboidCollider, { args: [5, 0.25, 5], position: [0, -0.25, 0] }),
                h(
                  'mesh',
                  { position: [0, -0.25, 0], onPointerDown: () => { probe.pointerHits++; } },
                  h('boxGeometry', { args: [10, 0.5, 10] }),
                  h('meshStandardMaterial', { color: '#437e59' }),
                ),
              ),
              included &&
                h(
                  RigidBody,
                  {
                    ref: (value) => {
                      body.current = value;
                      if (value) bodyHandle = value.handle;
                    },
                    position: [0, 5, 0],
                    colliders: false,
                  },
                  h(BallCollider, { args: [0.5] }),
                  h(
                    'mesh',
                    { onPointerDown: () => { probe.pointerHits++; } },
                    h('sphereGeometry', { args: [0.5, 24, 16] }),
                    h('meshStandardMaterial', { color: '#ffac35' }),
                  ),
                ),
            ),
          ),
        ),
    ),
    h('output', { id: 'status' }, '렌더러 초기화 중'),
  );
}
createRoot(document.getElementById('root')).render(
  new URLSearchParams(window.location.search).has('strict') ? h(React.StrictMode, null, h(App)) : h(App),
);
