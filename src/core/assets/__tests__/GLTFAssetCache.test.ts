import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { GLTFAssetCache } from '../GLTFAssetCache';

function model(): { gltf: GLTF; dispose: jest.Mock } {
  const geometry = new THREE.BoxGeometry();
  const dispose = jest.fn();
  geometry.dispose = dispose;
  const scene = new THREE.Group().add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
  return { gltf: { scene, scenes: [scene], animations: [] } as unknown as GLTF, dispose };
}

describe('GLTFAssetCache', () => {
  afterEach(() => jest.useRealTimers());

  it('keeps the most recently released models and disposes the one released longest ago past the limit', async () => {
    const models = new Map<string, ReturnType<typeof model>>();
    const cache = new GLTFAssetCache(async (uri) => {
      const loaded = model();
      models.set(uri, loaded);
      return loaded.gltf;
    }, { retained: 2 });
    for (const uri of ['a', 'b', 'c']) (await cache.acquire(uri)).release();
    expect(models.get('a')!.dispose).toHaveBeenCalledTimes(1);
    expect(models.get('b')!.dispose).not.toHaveBeenCalled();
    // Holding a retained model takes it out of line; returning to it does not load it again.
    const again = await cache.acquire('b');
    expect(again.gltf).toBe(models.get('b')!.gltf);
    (await cache.acquire('d')).release();
    expect(models.get('b')!.dispose).not.toHaveBeenCalled();
    expect(models.get('c')!.dispose).not.toHaveBeenCalled();
    (await cache.acquire('e')).release();
    expect(models.get('c')!.dispose).toHaveBeenCalledTimes(1);
    again.release();
    expect(models.get('d')!.dispose).toHaveBeenCalledTimes(1);
  });

  it('runs at most `concurrency` loads at once', async () => {
    let running = 0;
    let peak = 0;
    const cache = new GLTFAssetCache(async () => {
      peak = Math.max(peak, ++running);
      await new Promise((resolve) => setTimeout(resolve, 2));
      running--;
      return model().gltf;
    }, { concurrency: 2 });
    await Promise.all(['a', 'b', 'c', 'd', 'e'].map((uri) => cache.acquire(uri)));
    expect(peak).toBe(2);
  });

  it('suspends a render until the model loads, then returns the same model', async () => {
    const loaded = model();
    const cache = new GLTFAssetCache(async () => loaded.gltf);
    let pending: unknown;
    try {
      cache.read('a');
    } catch (thrown) {
      pending = thrown;
    }
    expect(pending).toBeInstanceOf(Promise);
    await pending;
    expect(cache.read('a')).toBe(loaded.gltf);
    const release = cache.retain('a');
    expect(cache.getReferenceCount('a')).toBe(1);
    release();
    expect(loaded.dispose).toHaveBeenCalledTimes(1);
  });

  it('fails fast during the retry pause, which doubles with each failure in a row', async () => {
    jest.useFakeTimers({ now: 0, doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    const load = jest.fn(async (): Promise<GLTF> => {
      throw new Error('offline');
    });
    const cache = new GLTFAssetCache(load, { retryMs: 1000 });
    await expect(cache.acquire('a')).rejects.toThrow('offline');
    expect(() => cache.read('a')).toThrow('offline');
    await expect(cache.acquire('a')).rejects.toThrow('offline');
    expect(load).toHaveBeenCalledTimes(1);
    jest.setSystemTime(1000);
    await expect(cache.acquire('a')).rejects.toThrow('offline');
    expect(load).toHaveBeenCalledTimes(2);
    jest.setSystemTime(2500);
    await expect(cache.acquire('a')).rejects.toThrow('offline');
    expect(load).toHaveBeenCalledTimes(2);
    const loaded = model();
    load.mockResolvedValueOnce(loaded.gltf);
    jest.setSystemTime(3000);
    expect((await cache.acquire('a')).gltf).toBe(loaded.gltf);
    expect(load).toHaveBeenCalledTimes(3);
  });
});
