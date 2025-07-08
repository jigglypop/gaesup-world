import * as THREE from 'three';
import { Profile, HandleError, MonitorMemory } from '../boilerplate/decorators';

const MAX_CACHE_SIZE = 100;
const MAX_TRIG_CACHE_SIZE = 1000;
const MAX_TEMP_VECTORS = 10;

export function createVectorCache() {
  const cache = new Map<string, THREE.Vector3>();
  const tempVectors = Array.from({ length: MAX_TEMP_VECTORS }, () => new THREE.Vector3());

  return {
    getTempVector: (index: number) => tempVectors[index % MAX_TEMP_VECTORS].set(0, 0, 0),
    getCached: (key: string, factory: () => THREE.Vector3) => {
      if (!cache.has(key)) {
        if (cache.size >= MAX_CACHE_SIZE) {
          cache.delete(cache.keys().next().value);
        }
        cache.set(key, factory());
      }
      return cache.get(key)!;
    },
    clear: () => cache.clear(),
    getStats: () => ({ cacheSize: cache.size, tempVectorCount: MAX_TEMP_VECTORS }),
  };
}

const trigCache = new Map<number, { sin: number; cos: number }>();

export const getCachedTrig = (angle: number) => {
  const key = Math.round(angle * 100) / 100;
  if (!trigCache.has(key)) {
    if (trigCache.size >= MAX_TRIG_CACHE_SIZE) {
      trigCache.delete(trigCache.keys().next().value);
    }
    trigCache.set(key, { sin: Math.sin(angle), cos: Math.cos(angle) });
  }
  return trigCache.get(key)!;
};

export const clearTrigCache = () => trigCache.clear();

export const getTrigCacheStats = () => ({
  size: trigCache.size,
  maxSize: MAX_TRIG_CACHE_SIZE,
  coverage: `${((trigCache.size / MAX_TRIG_CACHE_SIZE) * 100).toFixed(1)}%`,
});

export const normalizeAngle = (angle: number): number => {
  const TWO_PI = 2 * Math.PI;
  while (angle > Math.PI) angle -= TWO_PI;
  while (angle < -Math.PI) angle += TWO_PI;
  return angle;
};

export const shouldUpdate = (current: number, previous: number, threshold = 0.01) =>
  Math.abs(current - previous) >= threshold;

export const shouldUpdateVector3 = (
  current: THREE.Vector3,
  previous: THREE.Vector3,
  threshold = 0.01,
) => current.distanceTo(previous) >= threshold;

export class MemoizationManager {
  private static instance?: MemoizationManager;
  private vectorCaches = new Map<string, ReturnType<typeof createVectorCache>>();

  static getInstance() {
    return (this.instance ??= new MemoizationManager());
  }

  @Profile()
  getVectorCache(id: string) {
    return (
      this.vectorCaches.get(id) ??
      (this.vectorCaches.set(id, createVectorCache()), this.vectorCaches.get(id)!)
    );
  }

  @HandleError()
  clearAll() {
    this.vectorCaches.forEach((cache) => cache.clear());
    clearTrigCache();
  }

  @MonitorMemory(10)
  getStats() {
    return {
      vectorCaches: Array.from(this.vectorCaches.entries()).map(([id, cache]) => ({
        id,
        ...cache.getStats(),
      })),
      trigCache: getTrigCacheStats(),
    };
  }
}
