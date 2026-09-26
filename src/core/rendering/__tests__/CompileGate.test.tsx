import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { CompileGate, compileSubtreeAsync, setSceneRenderTarget } from '../CompileGate';

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
    expect(compileAsync).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([{ visible: true, culled: false }]);
    expect(gate.visible).toBe(false);
    expect(mesh.frustumCulled).toBe(true);
    await ReactThreeTestRenderer.act(async () => { finish(); });
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
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], { renderTarget: 'scene-pass', mrt: 'outputs', depth: 1 });
    await ReactThreeTestRenderer.act(async () => { finishes[0]!(); });
    expect(compiledFor).toEqual([[null, null], ['scene-pass', 'outputs']]);
    expect([target, mrt]).toEqual([null, null]);
    expect(gate.visible).toBe(false);
    await ReactThreeTestRenderer.act(async () => { finishes[1]!(); });
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
  setSceneRenderTarget(renderer, { renderTarget: 'scene-pass', mrt: 'outputs', depth: 1 });
  try {
    await compileSubtreeAsync(renderer, root, new THREE.PerspectiveCamera(), scene);
    expect(calls).toEqual([
      { target: 'scene-pass', mrt: 'outputs', depth: 1, override: null, hidden: [] },
      { target: 'cascade-0', mrt: null, depth: 2, override: shadowMaterial, hidden: ['flat'] },
    ]);
    expect([target, mrt, scene.overrideMaterial, flat.visible]).toEqual([null, null, null, true]);
  } finally {
    setSceneRenderTarget(renderer, null);
  }
});
