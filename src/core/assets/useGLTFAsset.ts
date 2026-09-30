import { useEffect } from 'react';

import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { gltfAssetCache } from './GLTFAssetCache';

/**
 * The model at `url`, suspending while it loads, from the cache every gaesup-world component shares
 * (`gltfAssetCache`): one download per model, held while a mounted component uses it, then kept among the most recently
 * released until newer ones push it out and its resources are disposed.
 */
export function useGLTFAsset(url: string): GLTF {
  const gltf = gltfAssetCache.read(url);
  useEffect(() => gltfAssetCache.retain(url), [url]);
  return gltf;
}
