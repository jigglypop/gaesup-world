import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { createToonWaterMaterial } from '../../src/core/rendering/tsl/toonWater';
import source from '../../src/core/building/components/mesh/water/index.tsx?raw';

const shader = (name) => source.match(new RegExp(`const ${name} =[\\s\\S]*?\u0060([\\s\\S]*?)\u0060;`))[1];
const geometry = new THREE.PlaneGeometry(12, 12, 40, 40);
const legacy = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uShallow: { value: new THREE.Color('#9ed6c8') },
    uDeep: { value: new THREE.Color('#1f5f88') }, uFoam: { value: new THREE.Color('#ffffff') } },
  vertexShader: shader('TOON_WATER_VERT'), fragmentShader: shader('TOON_WATER_FRAG'),
  transparent: true, depthWrite: false,
});
const nodes = createToonWaterMaterial();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 12, 9);
camera.lookAt(0, 0, 0);
const renderers = [new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }),
  new WebGPURenderer({ antialias: false, forceWebGL: true })];
const scenes = [legacy, nodes.material].map((material, index) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#18343b');
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);
  const renderer = renderers[index];
  renderer.setSize(320, 320);
  renderer.setPixelRatio(1);
  renderer.domElement.id = index === 0 ? 'legacy' : 'nodes';
  document.body.append(renderer.domElement);
  return scene;
});
await renderers[1].init();
window.waterCompare = {
  render(time) {
    legacy.uniforms.uTime.value = time;
    nodes.time.value = time;
    renderers.forEach((renderer, index) => renderer.render(scenes[index], camera));
    return { time, backend: renderers[1].backend.isWebGLBackend ? 'webgl2' : 'webgpu' };
  },
  dispose() {
    legacy.dispose(); nodes.material.dispose(); geometry.dispose();
    renderers.forEach((renderer) => renderer.dispose());
  },
};
window.waterCompare.render(0);
