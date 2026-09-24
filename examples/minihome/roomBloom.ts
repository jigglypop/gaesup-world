import { Vector2, type Camera, type Scene, type WebGLRenderer } from 'three';
import type { WebGPURenderer } from 'three/webgpu';

import type { createRenderer } from 'gaesup-world';

import type { RoomSettings } from './roomTypes';

/** Both render paths composite HDR bloom before the output color transform. */
export async function createRoomBloom(renderer: Awaited<ReturnType<typeof createRenderer>>, scene: Scene, camera: Camera) {
  if ('isWebGPURenderer' in renderer) {
    const [{ RenderPipeline }, { pass }, { bloom }] = await Promise.all([
      import('three/webgpu'), import('three/tsl'), import('three/addons/tsl/display/BloomNode.js'),
    ]);
    const scenePass = pass(scene, camera); const color = scenePass.getTextureNode('output');
    const glow = bloom(color, 0.6, 0.4, 1.2); const pipeline = new RenderPipeline(renderer as WebGPURenderer);
    pipeline.outputNode = color.add(glow);
    return {
      render: () => pipeline.render(),
      camera(value: Camera) { scenePass.camera = value; },
      resize() {},
      update(settings: RoomSettings) { glow.strength.value = settings.bloomStrength; glow.radius.value = settings.bloomRadius; glow.threshold.value = settings.bloomThreshold; },
      dispose() { pipeline.dispose(); glow.dispose(); scenePass.dispose(); },
    };
  }
  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
    import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'), import('three/addons/postprocessing/OutputPass.js'),
  ]);
  const composer = new EffectComposer(renderer as WebGLRenderer); const scenePass = new RenderPass(scene, camera);
  const glow = new UnrealBloomPass(new Vector2(1, 1), 0.6, 0.4, 1.2); const output = new OutputPass();
  composer.addPass(scenePass); composer.addPass(glow); composer.addPass(output);
  return {
    render: () => composer.render(),
    camera(value: Camera) { scenePass.camera = value; },
    resize(width: number, height: number, dpr: number) { composer.setPixelRatio(dpr); composer.setSize(width, height); },
    update(settings: RoomSettings) { glow.strength = settings.bloomStrength; glow.radius = settings.bloomRadius; glow.threshold = settings.bloomThreshold; },
    dispose() { scenePass.dispose(); glow.dispose(); output.dispose(); composer.dispose(); },
  };
}
