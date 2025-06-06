import * as THREE from 'three';

export function createVectorCache() {
  const cache = new Map<string, THREE.Vector3>();
  const tempVectors: THREE.Vector3[] = [];
  for (let i = 0; i < 10; i++) {
    tempVectors.push(new THREE.Vector3());
  }
  
  return {
    getTempVector(index: number): THREE.Vector3 {
      const vector = tempVectors[index % tempVectors.length];
      vector.set(0, 0, 0);
      return vector;
    },
    getCached(key: string, factory: () => THREE.Vector3): THREE.Vector3 {
      if (!cache.has(key)) {
        cache.set(key, factory());
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }
      return cache.get(key)!;
    },
    clear() {
      cache.clear();
    },
    getStats() {
      return {
        cacheSize: cache.size,
        tempVectorCount: tempVectors.length,
      };
    }
  };
}

export const trigCache = new Map<number, { sin: number; cos: number }>();
export function getCachedTrig(angle: number): { sin: number; cos: number } {
  const key = Math.round(angle * 100) / 100;
  if (!trigCache.has(key)) {
    trigCache.set(key, {
      sin: Math.sin(angle),
      cos: Math.cos(angle)
    });
    if (trigCache.size > 1000) {
      const firstKey = trigCache.keys().next().value;
      trigCache.delete(firstKey);
    }
  }
  return trigCache.get(key)!;
}

export function clearTrigCache(): void {
  trigCache.clear();
}

export function getTrigCacheStats() {
  return {
    size: trigCache.size,
    maxSize: 1000,
    coverage: `${((trigCache.size / 1000) * 100).toFixed(1)}%`
  };
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function shouldUpdate(current: number, previous: number, threshold: number = 0.01): boolean {
  return Math.abs(current - previous) >= threshold;
}

export function shouldUpdateVector3(current: THREE.Vector3, previous: THREE.Vector3, threshold: number = 0.01): boolean {
  return current.distanceTo(previous) >= threshold;
}

export class MemoizationManager {
  private static instance: MemoizationManager;
  private vectorCaches = new Map<string, ReturnType<typeof createVectorCache>>();
  
  static getInstance(): MemoizationManager {
    if (!this.instance) {
      this.instance = new MemoizationManager();
    }
    return this.instance;
  }
  
  getVectorCache(id: string): ReturnType<typeof createVectorCache> {
    if (!this.vectorCaches.has(id)) {
      this.vectorCaches.set(id, createVectorCache());
    }
    return this.vectorCaches.get(id)!;
  }
  
  clearAll(): void {
    this.vectorCaches.forEach(cache => cache.clear());
    clearTrigCache();
  }
  
  getStats() {
    const vectorStats = Array.from(this.vectorCaches.entries()).map(([id, cache]) => ({
      id,
      ...cache.getStats()
    }));
    
    return {
      vectorCaches: vectorStats,
      trigCache: getTrigCacheStats(),
    };
  }
} 