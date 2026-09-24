import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { FrameSchedulerHost } from '../../../../../runtime/frame';
import { LAMP_LIGHT_POOL_SIZE, LampLightPool, LampRegistry } from '../lampPool';

function lampAt(x: number) {
  const object = new THREE.Object3D();
  object.position.set(x, 1, 0);
  object.updateMatrixWorld();
  return { object, color: new THREE.Color('#ffcc88'), intensity: 0.65, distance: 5 };
}

test('the pool keeps a fixed light count and lends it to the nearest lamps', async () => {
  const registry = new LampRegistry();
  const renderer = await ReactThreeTestRenderer.create(<><FrameSchedulerHost /><LampLightPool registry={registry} /></>);
  try {
    const lights = () => renderer.scene.findAll((node) => node.instance instanceof THREE.PointLight);
    expect(lights()).toHaveLength(0);
    const removers = [30, 2, 12, 50, 1, 6].map((x) => registry.add(lampAt(x)));
    await renderer.update(<><FrameSchedulerHost /><LampLightPool registry={registry} /></>);
    expect(lights()).toHaveLength(LAMP_LIGHT_POOL_SIZE);
    await renderer.advanceFrames(2, 0.25);
    const lit = lights().map((node) => node.instance as THREE.PointLight).filter((light) => light.intensity > 0);
    expect(lit.map((light) => light.position.x).sort((a, b) => a - b)).toEqual([1, 2, 6, 12]);
    for (const remove of removers) remove();
    await renderer.update(<><FrameSchedulerHost /><LampLightPool registry={registry} /></>);
    await renderer.advanceFrames(2, 0.25);
    // Removing every lamp dims the pool but keeps its lights, so the light set never changes again.
    expect(lights()).toHaveLength(LAMP_LIGHT_POOL_SIZE);
    expect(lights().every((node) => (node.instance as THREE.PointLight).intensity === 0)).toBe(true);
  } finally {
    await renderer.unmount();
  }
});
