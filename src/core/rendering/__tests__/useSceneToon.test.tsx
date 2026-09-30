import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as THREE from 'three';

import { setDefaultToonMode } from '../toon';
import { useSceneToon } from '../useSceneToon';

function Probe({ root }: { root: THREE.Object3D }) {
  useSceneToon(root);
  return null;
}

function mount(root: THREE.Object3D): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<Probe root={root} />);
  });
  return renderer!;
}

describe('useSceneToon', () => {
  afterEach(() => setDefaultToonMode(false));

  it('restores and disposes generated toon materials on every unmount', () => {
    setDefaultToonMode(true);
    const source = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), source);
    const generated = new Set<THREE.Material>();

    for (let i = 0; i < 100; i++) {
      const renderer = mount(mesh);
      const toon = mesh.material as THREE.Material;
      expect(toon).toBeInstanceOf(THREE.MeshToonMaterial);
      generated.add(toon);
      const dispose = jest.spyOn(toon, 'dispose');
      act(() => renderer.unmount());
      expect(mesh.material).toBe(source);
      expect(dispose).toHaveBeenCalledTimes(1);
    }
    expect(generated.size).toBe(100);
  });

  it('leaves materials untouched when toon mode is off', () => {
    const source = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), source);
    const renderer = mount(mesh);
    expect(mesh.material).toBe(source);
    act(() => renderer.unmount());
  });
});
