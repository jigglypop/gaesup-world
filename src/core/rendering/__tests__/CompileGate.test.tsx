import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { CompileGate, compileSceneAsync, compileSubtreeAsync, setSceneRenderTarget } from '../CompileGate';

/** Lets queued compiles run: each starts on a later task, and a gate scans again once its compiles finish. */
const nextTasks = () => ReactThreeTestRenderer.act(async () => {
  for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0));
});

test('content stays hidden until its async compile resolves, compiled unculled and visible', async () => {
  let finish = () => {};
  const seen: { visible: boolean; culled: boolean }[] = [];
  const compileAsync = jest.fn((root: THREE.Object3D) => {
    let culled = false;
    root.traverse((object) => { if (object instanceof THREE.Mesh && object.frustumCulled) culled = true; });
    seen.push({ visible: root.visible, culled });
    return new Promise<void>((resolve) => { finish = resolve; });
  });
  function Patch() {
    Object.assign(useThree((state) => state.gl), { compileAsync });
    return null;
  }
  const renderer = await ReactThreeTestRenderer.create(
    <><Patch /><CompileGate><mesh name="content"><boxGeometry /><meshBasicMaterial /></mesh></CompileGate></>,
  );
  try {
    const gate = renderer.scene.findByProps({ name: 'content' }).instance.parent as THREE.Object3D;
    const mesh = renderer.scene.findByProps({ name: 'content' }).instance as THREE.Mesh;
    await nextTasks();
    expect(compileAsync).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([{ visible: true, culled: false }]);
    expect(gate.visible).toBe(false);
    expect(mesh.frustumCulled).toBe(true);
    finish();
    await nextTasks();
    expect(compileAsync).toHaveBeenCalledTimes(1);
    expect(gate.visible).toBe(true);
  } finally {
    await renderer.unmount();
  }
});

test('content compiles for the target a pass draws the scene into, and again if that target appears while it is hidden', async () => {
  const finishes: Array<() => void> = [];
  const compiledFor: unknown[] = [];
  let target: unknown = null;
  let mrt: unknown = null;
  const targeting = {
    getRenderTarget: () => target,
    setRenderTarget: (next: unknown) => { target = next; },
    getMRT: () => mrt,
    setMRT: (next: unknown) => { mrt = next; },
  };
  const compileAsync = jest.fn(() => {
    compiledFor.push([target, mrt]);
    return new Promise<void>((resolve) => { finishes.push(resolve); });
  });
  let gl: object = {};
  function Patch() {
    gl = Object.assign(useThree((state) => state.gl), { compileAsync, ...targeting });
    return null;
  }
  const renderer = await ReactThreeTestRenderer.create(
    <><Patch /><CompileGate><mesh name="content"><boxGeometry /><meshBasicMaterial /></mesh></CompileGate></>,
  );
  try {
    const gate = renderer.scene.findByProps({ name: 'content' }).instance.parent as THREE.Object3D;
    await nextTasks();
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], { renderTarget: 'scene-pass', mrt: null });
    finishes[0]!();
    await nextTasks();
    expect(compiledFor).toEqual([[null, null], ['scene-pass', null]]);
    expect([target, mrt]).toEqual([null, null]);
    expect(gate.visible).toBe(false);
    finishes[1]!();
    await nextTasks();
    expect(gate.visible).toBe(true);
  } finally {
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], null);
    await renderer.unmount();
  }
});

/** Render contexts keyed like three's: by target, outputs and how deep in nested renders they draw. */
function renderContexts() {
  const contexts = new Map<string, { target: unknown; mrt: unknown; depth: number }>();
  const ids = new Map<unknown, number>();
  const id = (value: unknown) => (ids.has(value) ? ids.get(value)! : ids.set(value, ids.size).get(value)!);
  return {
    get(target: unknown = null, mrt: unknown = null, depth = 0) {
      const key = `${id(target)}-${id(mrt)}-${depth}`;
      if (!contexts.has(key)) contexts.set(key, { target, mrt, depth });
      return contexts.get(key)!;
    },
  };
}

function shadowedScene() {
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  const caster = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
  caster.castShadow = true;
  caster.name = 'caster';
  const flat = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
  flat.name = 'flat';
  const inner = new THREE.Group();
  inner.add(caster, flat);
  root.add(inner);
  scene.add(root);
  const sun = new THREE.DirectionalLight();
  sun.castShadow = true;
  const shadowMaterial = new THREE.MeshBasicMaterial();
  const cascadeMap = { name: 'cascade-0' };
  Object.assign(sun.shadow, { shadowNode: { _shadowNodes: [{ shadowMap: cascadeMap, shadow: { camera: sun.shadow.camera }, getShadowMaterial: () => shadowMaterial }] } });
  scene.add(sun);
  return { scene, root, flat, shadowMaterial, cascadeMap };
}

test('a pass and the shadow maps compiled for draw with one render context at every depth, and the cascades compile with the shadow material', async () => {
  const { scene, root, flat, shadowMaterial, cascadeMap } = shadowedScene();
  const calls: { target: unknown; override: unknown; hidden: string[] }[] = [];
  let target: unknown = null;
  let mrt: unknown = null;
  const scenePass = { name: 'scene-pass' };
  const elsewhere = { name: 'elsewhere' };
  const renderer = {
    _renderContexts: renderContexts(),
    getRenderTarget: () => target,
    setRenderTarget: (next: unknown) => { target = next; },
    getMRT: () => mrt,
    setMRT: (next: unknown) => { mrt = next; },
    compileAsync: jest.fn(async () => {}),
  };
  renderer.compileAsync.mockImplementation(async () => {
    const hidden: string[] = [];
    root.traverse((object) => { if (!object.visible) hidden.push(object.name || object.type); });
    calls.push({ target, override: scene.overrideMaterial, hidden });
  });
  setSceneRenderTarget(renderer, { renderTarget: scenePass, mrt: null });
  try {
    await compileSubtreeAsync(renderer, root, new THREE.PerspectiveCamera(), scene);
    expect(calls).toEqual([
      { target: scenePass, override: null, hidden: [] },
      { target: cascadeMap, override: shadowMaterial, hidden: ['flat'] },
    ]);
    expect([target, mrt, scene.overrideMaterial, flat.visible]).toEqual([null, null, null, true]);
    // A postprocessing pass draws inside the passes that read it, and a shadow map inside whatever draws the scene.
    const contexts = renderer._renderContexts;
    expect(contexts.get(scenePass, null, 2)).toBe(contexts.get(scenePass, null, 0));
    expect(contexts.get(cascadeMap, null, 3)).toBe(contexts.get(cascadeMap, null, 1));
    expect(contexts.get(elsewhere, null, 1)).not.toBe(contexts.get(elsewhere, null, 0));
  } finally {
    setSceneRenderTarget(renderer, null);
  }
});

test('objects compiled for a pass with extra outputs build at once for its target and outputs; the rest build later as three does', async () => {
  const { scene, root, cascadeMap } = shadowedScene();
  let target: unknown = null;
  let mrt: unknown = null;
  const scenePass = { name: 'scene-pass' };
  const outputs = { name: 'outputs' };
  const built: { context: unknown; target: unknown; mrt: unknown; later: boolean }[] = [];
  const renderer = {
    _renderContexts: renderContexts(),
    _nodes: {
      getForRender: (renderObject: { context: unknown }) => { built.push({ context: renderObject.context, target, mrt, later: false }); },
      getForRenderAsync: async (renderObject: { context: unknown }) => { built.push({ context: renderObject.context, target, mrt, later: true }); },
    },
    getRenderTarget: () => target,
    setRenderTarget: (next: unknown) => { target = next; },
    getMRT: () => mrt,
    setMRT: (next: unknown) => { mrt = next; },
    // Like three: the context is looked up at once, the shaders are built on a later task with the renderer back on the canvas.
    compileAsync: jest.fn(async () => {
      const context = renderer._renderContexts.get(target, mrt);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await renderer._nodes.getForRenderAsync({ context });
    }),
  };
  setSceneRenderTarget(renderer, { renderTarget: scenePass, mrt: outputs });
  try {
    await compileSubtreeAsync(renderer, root, new THREE.PerspectiveCamera(), scene);
    const contexts = renderer._renderContexts;
    expect(built).toEqual([
      { context: contexts.get(scenePass, outputs), target: scenePass, mrt: outputs, later: false },
      { context: contexts.get(cascadeMap, null), target: null, mrt: null, later: true },
    ]);
    expect([target, mrt]).toEqual([null, null]);
  } finally {
    setSceneRenderTarget(renderer, null);
  }
});

test('a pass with extra outputs is not compiled ahead where its node builds cannot follow it: content shows at once and the pass takes over at once', async () => {
  const compileAsync = jest.fn(() => Promise.resolve());
  let gl: object = {};
  function Patch() {
    gl = Object.assign(useThree((state) => state.gl), { compileAsync });
    // three builds the shaders on later tasks with the renderer back on the canvas, so they would lack these outputs.
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], { renderTarget: 'scene-pass', mrt: 'outputs' });
    return null;
  }
  const renderer = await ReactThreeTestRenderer.create(
    <><Patch /><CompileGate><mesh name="content"><boxGeometry /><meshBasicMaterial /></mesh></CompileGate></>,
  );
  try {
    const gate = renderer.scene.findByProps({ name: 'content' }).instance.parent as THREE.Object3D;
    await ReactThreeTestRenderer.act(async () => { await Promise.resolve(); });
    expect(gate.visible).toBe(true);
    expect(compileSceneAsync(gl, new THREE.Scene(), new THREE.PerspectiveCamera())).toBeNull();
    expect(compileAsync).not.toHaveBeenCalled();
  } finally {
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], null);
    await renderer.unmount();
  }
});

test('alike drawables compile once, lights under the hidden gate light them, and content added meanwhile compiles before the gate shows', async () => {
  const finishes: Array<() => void> = [];
  const compiled: string[] = [];
  const gateShown: boolean[] = [];
  let gate: THREE.Object3D | null = null;
  const compileAsync = jest.fn((root: THREE.Object3D) => {
    compiled.push(root.name);
    // The drawable's parent is the gate; a compile can start before the test has looked the gate up.
    gateShown.push(Boolean(root.parent?.visible));
    return new Promise<void>((resolve) => { finishes.push(resolve); });
  });
  function Patch() {
    Object.assign(useThree((state) => state.gl), { compileAsync });
    return null;
  }
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial();
  const renderer = await ReactThreeTestRenderer.create(
    <><Patch /><CompileGate>
      <mesh name="a" geometry={geometry} material={material} />
      <mesh name="b" geometry={geometry} material={material} />
      <pointLight name="lamp" />
    </CompileGate></>,
  );
  try {
    gate = renderer.scene.findByProps({ name: 'a' }).instance.parent as THREE.Object3D;
    await nextTasks();
    expect(compiled).toEqual(['a']);
    expect(gateShown).toEqual([true]);
    expect(gate.visible).toBe(false);
    const late = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
    late.name = 'late';
    gate.add(late);
    finishes[0]!();
    await nextTasks();
    expect(compiled).toEqual(['a', 'late']);
    expect(gate.visible).toBe(false);
    finishes[1]!();
    await nextTasks();
    expect(gate.visible).toBe(true);
  } finally {
    await renderer.unmount();
  }
});
