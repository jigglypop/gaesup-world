import { act, renderHook } from '@testing-library/react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { setDefaultToonMode } from '../../../rendering/toon';
import { gltfAssetCache } from '../../../assets/GLTFAssetCache';
import { useGaesupGltf, useGltfAndSize } from '../useGaesupGltf';

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
    if (url.startsWith('data:')) return { animations: [], scene: new THREE.Group() };
    const gltf = mockGltfs.get(url);
    if (!gltf) throw new Error(`Missing mock GLTF: ${url}`);
    return gltf;
  }),
}));

jest.mock('../../../stores/gaesupStore', () => ({
  useGaesupStoreApi: () => ({ getState: () => mockStore }),
  useGaesupStore: Object.assign((selector: (state: typeof mockStore) => unknown) => selector(mockStore), { getState: () => mockStore }),
}));

jest.mock('../../../assets/GLTFAssetCache', () => ({ gltfAssetCache: { acquire: jest.fn() } }));

describe('useGltfAndSize source ownership', () => {
  beforeEach(() => {
    mockSetSizes.mockClear();
    mockSetSizes.mockImplementation((update: (sizes: typeof mockStore.sizes) => typeof mockStore.sizes) => { mockStore.sizes = update(mockStore.sizes); });
    jest.mocked(gltfAssetCache.acquire).mockReset();
    mockStore.sizes = {};
    mockGltfs.clear();
    setDefaultToonMode(true);
  });

  afterEach(() => {
    setDefaultToonMode(false);
  });

  test('measures both URLs when an existing hook switches assets', () => {
    const scene = (x: number) => new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(x, 2, 3)));
    mockGltfs.set('/a.glb', { scene: scene(1), animations: [] });
    mockGltfs.set('/b.glb', { scene: scene(4), animations: [] });
    const { result, rerender } = renderHook(({ url }) => useGltfAndSize({ url }), { initialProps: { url: '/a.glb' } });
    expect(mockStore.sizes['/a.glb']?.toArray()).toEqual([1, 2, 3]);
    rerender({ url: '/b.glb' });
    expect(mockStore.sizes['/b.glb']?.toArray()).toEqual([4, 2, 3]);
    expect(result.current.getSize()?.toArray()).toEqual([4, 2, 3]);
  });

  test.each([undefined, '', '   '])('uses a valid empty GLTF for missing URL %s', url => {
    const { result } = renderHook(() => useGltfAndSize(url === undefined ? {} : { url }));
    const requested = jest.mocked(useGLTF).mock.calls.at(-1)![0] as string;
    expect(JSON.parse(decodeURIComponent(requested.split(',')[1]!)).asset.version).toBe('2.0');
    expect(result.current.size.toArray()).toEqual([1, 1, 1]);
    expect(mockSetSizes).not.toHaveBeenCalled();
  });

  test('preloads actual dimensions once per URL, publishes before resolving and releases the asset lease', async () => {
    const scene = new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(7, 8, 9)));
    const release = jest.fn();
    jest.mocked(gltfAssetCache.acquire).mockResolvedValue({ gltf: { scene } as unknown as Awaited<ReturnType<typeof gltfAssetCache.acquire>>['gltf'], release });
    const { result } = renderHook(() => useGaesupGltf());
    const utils = result.current;
    await act(() => utils.preloadSizes(['/preload.glb', '/preload.glb', '']));
    expect(utils.getSizesByUrls({ model: '/preload.glb' })['model']?.toArray()).toEqual([7, 8, 9]);
    expect(gltfAssetCache.acquire).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
    await act(() => utils.preloadSizes(['/preload.glb']));
    expect(gltfAssetCache.acquire).toHaveBeenCalledTimes(1);
  });

  test('propagates preload failure without inventing a cached size', async () => {
    jest.mocked(gltfAssetCache.acquire).mockRejectedValue(new Error('load failed'));
    const { result } = renderHook(() => useGaesupGltf());
    await expect(result.current.preloadSizes(['/bad.glb'])).rejects.toThrow('load failed');
    expect(mockStore.sizes['/bad.glb']).toBeUndefined();
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
