import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ResourceUrlsType } from '../types/core';
import { getPooledVector } from './vector';
import { useGaesupStore } from '../stores/gaesupStore';
import { GLTF } from 'three-stdlib';

export interface GltfAndSizeOptions {
  url?: string;
}

export interface GltfAndSizeResult {
  gltf: GLTF;
  size: THREE.Vector3;
  setSize: (newSize: THREE.Vector3, keyName?: string) => void;
  getSize: (keyName?: string) => THREE.Vector3 | null;
}

const gltfCache = new Map<string, { gltf: GLTF; refCount: number; size: THREE.Vector3 }>();
const defaultSize = new THREE.Vector3(1, 1, 1);
const tempBox3 = new THREE.Box3();

const cleanupGltf = (url: string) => {
  const cached = gltfCache.get(url);
  if (cached && --cached.refCount <= 0) {
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

  const safeUrl = url ?? 'data:application/json,{}';
  const isValidUrl = Boolean(url?.trim());

  const gltf = useGLTF(safeUrl) as GLTF;
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
    setSizes((prev) => ({ ...prev, [url]: newSize }));
  }, [url, gltf.scene, sizes, setSizes, calculateSize, isValidUrl]);

  const size = useMemo(
    () => (isValidUrl && url ? (sizes[url] ?? defaultSize) : defaultSize),
    [sizes, url, isValidUrl],
  );

  const setSize = useCallback(
    (newSize: THREE.Vector3, keyName?: string) => {
      if (!isValidUrl) return;
      const key = keyName ?? url;
      if (key) {
        void Promise.resolve().then(() => setSizes((prev) => ({ ...prev, [key]: newSize })));
      }
    },
    [url, setSizes, isValidUrl],
  );

  const getSize = useCallback(
    (keyName?: string) => {
      if (!isValidUrl) return null;
      const key = keyName ?? url;
      return key ? (sizes[key] ?? null) : null;
    },
    [url, sizes, isValidUrl],
  );

  return { gltf, size, setSize, getSize };
};

export interface GaesupGltfUtils {
  getSizesByUrls: (urls?: ResourceUrlsType) => Record<string, THREE.Vector3 | null>;
  preloadSizes: (urls: string[]) => void;
}

export const useGaesupGltf = (): GaesupGltfUtils => {
  const sizes = useGaesupStore((state) => state.sizes);

  const getSizesByUrls = useCallback(
    (urls?: ResourceUrlsType) => {
      if (!urls) return {};
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
    [sizes],
  );

  const preloadSizes = useCallback((urls: string[]) => {
    console.log('GLTF 프리로딩이 비활성화되었습니다:', urls);
  }, []);

  return { getSizesByUrls, preloadSizes };
};
