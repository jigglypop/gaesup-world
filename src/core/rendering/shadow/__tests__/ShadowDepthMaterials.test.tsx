import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as THREE from 'three';

import { frameScheduler } from '../../../runtime/frame';
import { ShadowDepthMaterials } from '../ShadowDepthMaterials';

const mockState: { gl: object; scene: THREE.Scene } = { gl: {}, scene: new THREE.Scene() };

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

function mountWith(gl: object): { traverse: jest.SpyInstance; renderer: ReactTestRenderer } {
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  mesh.castShadow = true;
  scene.add(mesh);
  mockState.gl = gl;
  mockState.scene = scene;
  const traverse = jest.spyOn(scene, 'traverse');
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<ShadowDepthMaterials />);
  });
  for (let i = 0; i < 3; i++) frameScheduler.tick(1, i * 1000);
  return { traverse, renderer: renderer! };
}

describe('ShadowDepthMaterials', () => {
  it('never walks the scene on WebGPU renderers', () => {
    const { traverse, renderer } = mountWith({ isWebGPURenderer: true });
    expect(traverse).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it('assigns depth variants on WebGL renderers', () => {
    const { traverse, renderer } = mountWith({ isWebGLRenderer: true });
    expect(traverse).toHaveBeenCalled();
    act(() => renderer.unmount());
  });
});
