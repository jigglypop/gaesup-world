import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFResult } from '../component/types';
import { ResourceUrlsType } from '../../types';
import { getPooledVector } from './vector';
import { useGaesupStore } from '../stores/gaesupStore';

export interface GltfAndSizeOptions {
  url?: string;
}

export interface GltfAndSizeResult {
  gltf: GLTFResult;
  size: THREE.Vector3;
  setSize: (newSize: THREE.Vector3, keyName?: string) => void;
  getSize: (keyName?: string) => THREE.Vector3 | null;
}

const gltfCache = new Map<string, { gltf: GLTFResult; refCount: number; size: THREE.Vector3 }>();
const defaultSize = new THREE.Vector3(1, 1, 1);
const tempBox3 = new THREE.Box3();

const cleanupGltf = (url: string) => {
  const cached = gltfCache.get(url);
  if (cached && --cached.refCount <= 0) {
    cached.gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material) {
          (Array.isArray(child.material) ? child.material : [child.material]).forEach((mat) =>
            mat.dispose(),
          );
        }
      }
    });
    gltfCache.delete(url);
  }
};

const calculateSizeFromScene = (scene: THREE.Object3D): THREE.Vector3 => {
  try {
    return tempBox3.setFromObject(scene).getSize(getPooledVector());
  } catch {
    return defaultSize.clone();
  }
};

export const useGltfAndSize = ({ url }: GltfAndSizeOptions): GltfAndSizeResult => {
  const sizes = useGaesupStore((state) => state.sizes);
  const setSizes = useGaesupStore((state) => state.setSizes);

  const safeUrl = url || 'data:application/json,{}';
  const isValidUrl = Boolean(url?.trim());

  const gltf = useGLTF(safeUrl) as GLTFResult;
  const isInitialized = useRef(false);

  const calculateSize = useCallback(
    () => (isValidUrl && gltf.scene ? calculateSizeFromScene(gltf.scene) : defaultSize.clone()),
    [gltf.scene, isValidUrl],
  );

  useEffect(() => {
    if (!url || !isValidUrl) return;

    const cached = gltfCache.get(url);
    if (cached) {
      cached.refCount++;
    } else {
      gltfCache.set(url, { gltf, refCount: 1, size: calculateSize() });
    }

    return () => cleanupGltf(url);
  }, [url, isValidUrl, gltf, calculateSize]);

  useEffect(() => {
    if (isInitialized.current || !isValidUrl || !url || !gltf.scene || sizes[url]) return;

    isInitialized.current = true;
    const newSize = calculateSize();
    setSizes((prev) => ({ ...prev, [url!]: newSize }));
  }, [url, gltf.scene, sizes, setSizes, calculateSize, isValidUrl]);

  const size = useMemo(
    () => (isValidUrl && url ? sizes[url] || defaultSize : defaultSize),
    [sizes, url, isValidUrl],
  );

  const setSize = useCallback(
    (newSize: THREE.Vector3, keyName?: string) => {
      if (!isValidUrl) return;
      const key = keyName || url;
      Promise.resolve().then(() => setSizes((prev) => ({ ...prev, [key!]: newSize })));
    },
    [url, setSizes, isValidUrl],
  );

  const getSize = useCallback(
    (keyName?: string) => {
      if (!isValidUrl) return null;
      const key = keyName || url;
      return key ? sizes[key] || null : null;
    },
    [url, sizes, isValidUrl],
  );

  return { gltf, size, setSize, getSize };
};

export interface GaesupGltfUtils {
  getSizesByUrls: (urls?: ResourceUrlsType) => Record<string, THREE.Vector3 | null>;
  preloadSizes: (urls: string[]) => Promise<void>;
}

export const useGaesupGltf = (): GaesupGltfUtils => {
  const sizes = useGaesupStore((state) => state.sizes);
  const setSizes = useGaesupStore((state) => state.setSizes);

  const getSizesByUrls = useCallback(
    (urls?: ResourceUrlsType) => {
      if (!urls) return {};
      return Object.fromEntries(
        Object.entries(urls).map(([key, url]) => [key, url ? sizes[url] || null : null]),
      );
    },
    [sizes],
  );

  const preloadSizes = useCallback(
    async (urls: string[]) => {
      const urlsToLoad = urls.filter((url) => url && !sizes[url]);
      if (!urlsToLoad.length) return;

      const results = await Promise.allSettled(
        urlsToLoad.map(async (url) => {
          try {
            const gltf: any = await useGLTF.preload(url);
            if (gltf?.scene) {
              return { url, size: calculateSizeFromScene(gltf.scene) };
            }
          } catch (error) {
            console.error(`Failed to preload ${url}:`, error);
          }
          return null;
        }),
      );

      const newSizes = results.reduce(
        (acc, result) => {
          if (result.status === 'fulfilled' && result.value) {
            acc[result.value.url] = result.value.size;
          }
          return acc;
        },
        {} as Record<string, THREE.Vector3>,
      );

      if (Object.keys(newSizes).length) {
        setSizes((prev) => ({ ...prev, ...newSizes }));
      }
    },
    [sizes, setSizes],
  );

  return { getSizesByUrls, preloadSizes };
};
