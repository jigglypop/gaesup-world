import { useCallback, useEffect, useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { GltfAndSizeOptions, GltfAndSizeResult, GaesupGltfUtils, ResourceUrlsType } from './types';
import { gltfAssetCache } from '../../assets/GLTFAssetCache';
import { useGaesupStore, useGaesupStoreApi } from '../../stores/gaesupStore';

const defaultSize = new THREE.Vector3(1, 1, 1);
const tempBox3 = new THREE.Box3();
const EMPTY_GLTF_URL = `data:model/gltf+json,${encodeURIComponent(JSON.stringify({ asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [] }], nodes: [] }))}`;

const calculateSizeFromScene = (scene: THREE.Object3D): THREE.Vector3 => {
  try {
    return tempBox3.setFromObject(scene).getSize(new THREE.Vector3());
  } catch {
    return defaultSize.clone();
  }
};

export const useGltfAndSize = ({ url }: GltfAndSizeOptions): GltfAndSizeResult => {
  const storeApi = useGaesupStoreApi();
  const sizes = useGaesupStore((state) => state.sizes);
  const setSizes = useGaesupStore((state) => state.setSizes);
  const isValidUrl = Boolean(url?.trim());
  const safeUrl = isValidUrl ? url! : EMPTY_GLTF_URL;
  const gltf = useGLTF(safeUrl);
  const calculateSize = useCallback(
    () => (isValidUrl && gltf.scene ? calculateSizeFromScene(gltf.scene) : defaultSize.clone()),
    [gltf.scene, isValidUrl],
  );

  useEffect(() => {
    if (!isValidUrl || !url || !gltf.scene || sizes[url]) return;
    const newSize = calculateSize();
    setSizes((prev) => ({ ...prev, [url]: newSize }));
  }, [url, gltf.scene, sizes, setSizes, calculateSize, isValidUrl]);

  const size = useMemo(
    () => (isValidUrl && url ? (sizes[url] ?? defaultSize.clone()) : defaultSize.clone()),
    [sizes, url, isValidUrl],
  );

  const setSize = useCallback(
    (newSize: THREE.Vector3, keyName?: string) => {
      if (!isValidUrl) return;
      const key = keyName ?? url;
      if (key) {
        const ownedSize = newSize.clone();
        void Promise.resolve().then(() => setSizes((prev) => ({ ...prev, [key]: ownedSize })));
      }
    },
    [url, setSizes, isValidUrl],
  );
  const getSize = useCallback(
    (keyName?: string) => {
      if (!isValidUrl) return null;
      const key = keyName ?? url;
      return key ? (storeApi.getState().sizes[key] ?? null) : null;
    },
    [url, isValidUrl, storeApi],
  );

  return { gltf, size, setSize, getSize };
};

export const useGaesupGltf = (): GaesupGltfUtils => {
  const storeApi = useGaesupStoreApi();
  useGaesupStore((state) => state.sizes);
  const getSizesByUrls = useCallback(
    (urls?: ResourceUrlsType) => {
      if (!urls) return {};
      const sizes = storeApi.getState().sizes;
      const result: Record<string, THREE.Vector3 | null> = {};
      Object.entries(urls as Record<string, string>).forEach(([key, url]) => {
        if (typeof url === 'string') {
          result[key] = sizes[url] ?? null;
        } else {
          result[key] = null;
        }
      });

      return result;
    },
    [storeApi],
  );
  const preloadSizes = useCallback(async (urls: string[]) => {
    await Promise.all([...new Set(urls.filter(url => url.trim()))].map(async url => {
      if (storeApi.getState().sizes[url]) return;
      const lease = await gltfAssetCache.acquire(url);
      try {
        const size = calculateSizeFromScene(lease.gltf.scene);
        storeApi.getState().setSizes(previous => previous[url] ? previous : { ...previous, [url]: size });
      } finally { lease.release(); }
    }));
  }, [storeApi]);
  return { getSizesByUrls, preloadSizes };
};
