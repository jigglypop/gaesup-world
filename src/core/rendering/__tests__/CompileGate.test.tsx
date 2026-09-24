import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { CompileGate } from '../CompileGate';

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
