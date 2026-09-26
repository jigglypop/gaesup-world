import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { CompileGate, setSceneRenderTarget } from '../CompileGate';

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
    setSceneRenderTarget(gl as Parameters<typeof setSceneRenderTarget>[0], { renderTarget: 'scene-pass', mrt: 'outputs' });
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
