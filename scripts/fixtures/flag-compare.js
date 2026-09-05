import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { FlagNodeMaterial } from '../../src/core/rendering/tsl/flag';
import vertexShader from '/flag-vert.js';
import fragmentShader from '/flag-frag.js';

const pixels = new Uint8Array([
  220, 40, 30, 255, 30, 180, 80, 255, 30, 80, 220, 128, 255, 220, 40, 0,
]);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(3, 2, 10);
camera.lookAt(0, 0, 0);
const renderers = [
  new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }),
  new WebGPURenderer({ antialias: false, forceWebGL: true }),
];
renderers.forEach((renderer, index) => {
  renderer.setSize(320, 320);
  renderer.setPixelRatio(1);
  renderer.domElement.id = index === 0 ? 'legacy' : 'nodes';
  document.body.append(renderer.domElement);
});
await renderers[1].init();
const cases = new Map();
for (const mode of ['single', 'batch', 'batch-srgb']) {
  const instanced = mode !== 'single';
  const map = new THREE.DataTexture(pixels, 2, 2);
  map.colorSpace = mode.endsWith('srgb') ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  map.needsUpdate = true;
  const legacy = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      map: { value: map },
      time: { value: 0 },
      windStrength: { value: 1 },
      transmission: { value: 0.05 },
      envMapIntensity: { value: 1 },
    },
    side: THREE.DoubleSide,
    transparent: true,
  });
  const nodes = new FlagNodeMaterial(map, instanced);
  const geometry = new THREE.PlaneGeometry(2, 1.5, 12, 6);
  const positions = [
    [-1.4, 0.7, 0, 1, 1],
    [1.1, -0.7, 0.5, 0.7, 1.5],
  ];
  geometry.setAttribute(
    'flagMotion',
    new THREE.InstancedBufferAttribute(
      new Float32Array(positions.flatMap(([x, , z, , sy]) => [x * 0.3 + z * 0.5, sy])),
      2,
    ),
  );
  const scenes = [legacy, nodes].map((material) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#18343b');
    const mesh = instanced
      ? new THREE.InstancedMesh(geometry, material, positions.length)
      : new THREE.Mesh(geometry, material);
    if (instanced)
      positions.forEach(([x, y, z, sx, sy], index) => {
        const matrix = new THREE.Matrix4().makeScale(sx, sy, 1).setPosition(x, y, z);
        mesh.setMatrixAt(index, matrix);
      });
    scene.add(mesh);
    return scene;
  });
  cases.set(mode, { legacy, nodes, geometry, scenes, map });
}
window.waterCompare = {
  render(time, mode = 'single') {
    const current = cases.get(mode);
    current.legacy.uniforms.time.value = time * 5;
    current.nodes.time = time * 5;
    renderers.forEach((renderer, index) => renderer.render(current.scenes[index], camera));
    return { time, mode, backend: 'webgl2' };
  },
  dispose() {
    cases.forEach(({ legacy, nodes, geometry, map }) => {
      legacy.dispose();
      nodes.dispose();
      geometry.dispose();
      map.dispose();
    });
    renderers.forEach((renderer) => renderer.dispose());
  },
};
window.waterCompare.render(0);
