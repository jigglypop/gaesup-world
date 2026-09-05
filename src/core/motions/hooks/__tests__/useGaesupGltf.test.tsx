import { renderHook } from '@testing-library/react';
import * as THREE from 'three';

import { setDefaultToonMode } from '../../../rendering/toon';
import { useGltfAndSize } from '../useGaesupGltf';

type MockGltf = {
  animations: THREE.AnimationClip[];
  scene: THREE.Object3D;
};

const mockSetSizes = jest.fn();
const mockStore = {
  setSizes: mockSetSizes,
  sizes: {} as Record<string, THREE.Vector3>,
};
const mockGltfs = new Map<string, MockGltf>();

jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn((url: string) => {
    const gltf = mockGltfs.get(url);
    if (!gltf) throw new Error(`Missing mock GLTF: ${url}`);
    return gltf;
  }),
}));

jest.mock('../../../stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

describe('useGltfAndSize source ownership', () => {
  beforeEach(() => {
    mockSetSizes.mockClear();
    mockStore.sizes = {};
    mockGltfs.clear();
    setDefaultToonMode(true);
  });

  afterEach(() => {
    setDefaultToonMode(false);
  });

  test('returns the Drei GLTF identities without projecting toon onto the source scene', () => {
    const firstMaterial = new THREE.MeshStandardMaterial({ color: '#336699' });
    const firstScene = new THREE.Group();
    firstScene.add(new THREE.Mesh(new THREE.BoxGeometry(), firstMaterial));
    const firstAnimations = [new THREE.AnimationClip('idle', 1, [])];
    const firstGltf = { animations: firstAnimations, scene: firstScene };
    const secondMaterial = new THREE.MeshStandardMaterial({ color: '#663399' });
    const secondScene = new THREE.Group();
    secondScene.add(new THREE.Mesh(new THREE.BoxGeometry(), secondMaterial));
    const secondAnimations = [new THREE.AnimationClip('walk', 1, [])];
    const secondGltf = { animations: secondAnimations, scene: secondScene };
    mockGltfs.set('/first.glb', firstGltf);
    mockGltfs.set('/second.glb', secondGltf);

    const { result, rerender } = renderHook(({ url }: { url: string }) => useGltfAndSize({ url }), {
      initialProps: { url: '/first.glb' },
    });

    expect(result.current.gltf).toBe(firstGltf);
    expect(result.current.gltf.scene).toBe(firstScene);
    expect(result.current.gltf.animations).toBe(firstAnimations);
    expect((firstScene.children[0] as THREE.Mesh).material).toBe(firstMaterial);
    expect(firstMaterial.isMeshStandardMaterial).toBe(true);

    rerender({ url: '/second.glb' });
    expect(result.current.gltf).toBe(secondGltf);
    expect(result.current.gltf.scene).toBe(secondScene);
    expect(result.current.gltf.animations).toBe(secondAnimations);
    expect((firstScene.children[0] as THREE.Mesh).material).toBe(firstMaterial);
    expect((secondScene.children[0] as THREE.Mesh).material).toBe(secondMaterial);
  });
});
