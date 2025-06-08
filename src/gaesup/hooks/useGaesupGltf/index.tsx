import { useGLTF } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gameStore } from '../../store/gameStore';
import { gameActions } from '../../store/actions';
import { GLTFResult } from '../../component/types';
import { ResourceUrlsType } from '../../types';
import { GltfAndSizeReturnType, gltfAndSizeType, useGltfAndSizeType } from './types';

const gltfCache = new Map<
  string,
  {
    gltf: GLTFResult;
    refCount: number;
    size: THREE.Vector3;
  }
>();

const cleanupGltf = (url: string) => {
  const cached = gltfCache.get(url);
  if (cached) {
    cached.refCount--;
    if (cached.refCount <= 0) {
      cached.gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      gltfCache.delete(url);
    }
  }
};

export const useGltfAndSize = ({ url }: useGltfAndSizeType): GltfAndSizeReturnType => {
  const sizes = useSnapshot(gameStore.resources.sizes);

  const safeUrl = url || 'data:application/json,{}';
  const isValidUrl = Boolean(url && url.trim() !== '');

  const gltf = useGLTF(safeUrl) as GLTFResult;
  const { scene } = gltf;

  const isInitialized = useRef(false);

  const calculateSize = useCallback(() => {
    if (!isValidUrl || !scene) {
      return new THREE.Vector3(1, 1, 1);
    }
    try {
      return new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    } catch {
      return new THREE.Vector3(1, 1, 1);
    }
  }, [scene, isValidUrl]);

  useEffect(() => {
    if (url && isValidUrl) {
      const cached = gltfCache.get(url);
      if (cached) {
        cached.refCount++;
      } else {
        gltfCache.set(url, {
          gltf,
          refCount: 1,
          size: calculateSize(),
        });
      }
    }

    return () => {
      if (url && isValidUrl) {
        cleanupGltf(url);
      }
    };
  }, [url, isValidUrl, gltf, calculateSize]);

  useEffect(() => {
    if (!isInitialized.current && isValidUrl && url && scene && !(url in sizes)) {
      isInitialized.current = true;
      const newSize = calculateSize();
      gameActions.updateSizes({
        ...sizes,
        [url]: newSize,
      });
    }
  }, [url, scene, sizes, calculateSize, isValidUrl]);

  const size = useMemo(() => {
    if (!isValidUrl) {
      return new THREE.Vector3(1, 1, 1);
    }
    return sizes[url] || new THREE.Vector3(1, 1, 1);
  }, [sizes, url, isValidUrl]);

  const setSize = useCallback(
    (newSize: THREE.Vector3, keyName?: string) => {
      if (!isValidUrl) return;
      const key = keyName || url;
      Promise.resolve().then(() => {
        gameActions.updateSizes({
          ...sizes,
          [key]: newSize,
        });
      });
    },
    [url, sizes, isValidUrl],
  );

  const getSize = useCallback(
    (keyName?: string) => {
      if (!isValidUrl) return null;
      const key = keyName || url;
      return sizes[key] || null;
    },
    [url, sizes, isValidUrl],
  );

  return { gltf, size, setSize, getSize };
};

export const useGaesupGltf = () => {
  const sizes = useSnapshot(gameStore.resources.sizes);

  const getSizesByUrls = useCallback(
    (urls?: ResourceUrlsType) => {
      const matchedSizes: { [key in keyof ResourceUrlsType]?: THREE.Vector3 | null } = {};
      if (!urls) return matchedSizes;

      Object.keys(urls).forEach((key) => {
        const url = urls[key as keyof ResourceUrlsType];
        if (url && url in sizes) {
          matchedSizes[key as keyof ResourceUrlsType] = sizes[url] || null;
        } else {
          matchedSizes[key as keyof ResourceUrlsType] = null;
        }
      });

      return matchedSizes;
    },
    [sizes],
  );

  const preloadSizes = useCallback(
    async (urls: string[]) => {
      const urlsToLoad = urls.filter((url) => url && !(url in sizes));

      if (urlsToLoad.length === 0) return;

      const loadPromises = urlsToLoad.map(async (url) => {
        try {
          const gltf = await useGLTF.preload(url);
          if (gltf && (gltf as GLTFResult).scene) {
            const size = new THREE.Box3()
              .setFromObject((gltf as GLTFResult).scene)
              .getSize(new THREE.Vector3());
            return { url, size };
          }
          return null;
        } catch (error) {
          console.error(`Failed to preload ${url}:`, error);
          return null;
        }
      });

      const results = await Promise.all(loadPromises);

      const newSizes = { ...sizes };
      results.forEach((result) => {
        if (result) {
          newSizes[result.url] = result.size;
        }
      });
      gameActions.updateSizes(newSizes);
    },
    [sizes],
  );

  return { getSizesByUrls, preloadSizes };
};
