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
    // Compiles start on a later task, never in the commit that mounted the content.
    expect(compileAsync).not.toHaveBeenCalled();
    expect(gate.visible).toBe(false);
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
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], { renderTarget: 'scene-pass', mrt: null, depth: 1 });
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

test('a subtree compiles at the nesting depth its pass draws at, and for each shadow cascade one render deeper', async () => {
  const calls: { target: unknown; mrt: unknown; depth: number | undefined; override: unknown; hidden: string[] }[] = [];
  let target: unknown = null;
  let mrt: unknown = null;
  const contexts = { get: jest.fn((_target?: unknown, _mrt?: unknown, depth?: number) => depth) };
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
  Object.assign(sun.shadow, { shadowNode: { _shadowNodes: [{ shadowMap: 'cascade-0', shadow: { camera: sun.shadow.camera }, getShadowMaterial: () => shadowMaterial }] } });
  scene.add(sun);
  const renderer = {
    _renderContexts: contexts,
    getRenderTarget: () => target,
    setRenderTarget: (next: unknown) => { target = next; },
    getMRT: () => mrt,
    setMRT: (next: unknown) => { mrt = next; },
    compileAsync: jest.fn(async () => {}),
  };
  renderer.compileAsync.mockImplementation(async () => {
    const hidden: string[] = [];
    root.traverse((object) => { if (!object.visible) hidden.push(object.name || object.type); });
    calls.push({ target, mrt, depth: contexts.get(target, mrt) as number | undefined, override: scene.overrideMaterial, hidden });
  });
  setSceneRenderTarget(renderer, { renderTarget: 'scene-pass', mrt: null, depth: 1 });
  try {
    await compileSubtreeAsync(renderer, root, new THREE.PerspectiveCamera(), scene);
    expect(calls).toEqual([
      { target: 'scene-pass', mrt: null, depth: 1, override: null, hidden: [] },
      { target: 'cascade-0', mrt: null, depth: 2, override: shadowMaterial, hidden: ['flat'] },
    ]);
    expect([target, mrt, scene.overrideMaterial, flat.visible]).toEqual([null, null, null, true]);
  } finally {
    setSceneRenderTarget(renderer, null);
  }
});

test('a pass with extra outputs is not compiled ahead: content shows at once and the pass takes over at once', async () => {
  const compileAsync = jest.fn(() => Promise.resolve());
  let gl: object = {};
  function Patch() {
    gl = Object.assign(useThree((state) => state.gl), { compileAsync });
    // three builds the shaders on later tasks with the renderer back on the canvas, so they would lack these outputs.
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], { renderTarget: 'scene-pass', mrt: 'outputs', depth: 1 });
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
    gateShown.push(Boolean(gate?.visible));
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
